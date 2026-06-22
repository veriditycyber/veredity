// TrueHire backend — serves the demo UI and runs REAL deepfake detection
// through the Reality Defender API for uploaded files.
//
//   Samples in the UI stay scripted (for a reliable live demo story);
//   "drop your own" file uploads are sent here and scored by Reality Defender.
//
// Run:  npm install  &&  npm start   (set RD_API_KEY in .env first)

import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RealityDefender } from '@realitydefender/realitydefender';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RD_API_KEY;
const ACCESS_CODE = process.env.ACCESS_CODE || '';            // gate so randoms can't burn scans
const MAX_MONTHLY_SCANS = Number(process.env.MAX_MONTHLY_SCANS || 45);  // protect the free tier (50/mo)

// Simple in-memory scan counter that resets at the start of each month.
// (Good enough to protect the free quota on a single pilot instance.)
let scanMonth = new Date().getUTCMonth();
let scanCount = 0;
function bumpScan() {
  const m = new Date().getUTCMonth();
  if (m !== scanMonth) { scanMonth = m; scanCount = 0; }
  scanCount += 1;
}

const app = express();

// Serve the frontend (the demo folder, one level up).
app.use(express.static(path.join(__dirname, '..', 'demo')));

// Store uploads in the OS temp dir, PRESERVING the file extension — Reality
// Defender needs it to detect the media type (a name-less temp file → API error).
const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `truehire-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Map a Reality Defender result -> the shape the frontend renders.
// RD: { status: "MANIPULATED"|"AUTHENTIC"|..., score: 0..1 (higher = more manipulated), models:[{name,status,score}] }
function mapResult(rd, filename) {
  const score = Math.round((rd.score ?? 0) * 100);     // 0..100 risk
  let band = 'green';
  if (score >= 70) band = 'red';
  else if (score >= 40) band = 'yellow';

  const titleMap = {
    green: 'Likely genuine',
    yellow: 'Inconclusive — human review needed',
    red: 'High risk — likely manipulated',
  };
  const recMap = {
    green: '<b>Proceed.</b> Reality Defender found no elevated manipulation risk in this media.',
    yellow: '<b>Manual review advised.</b> The score is ambiguous — re-verify with a live, monitored check.',
    red: '<b>Escalate — do not advance.</b> Reality Defender flags likely manipulation. Require secondary identity verification.',
  };

  const signals = (rd.models || [])
    .filter(m => m.score != null && m.status !== 'ANALYZING')   // drop models that didn't finish
    .map(m => {
      const ms = Math.round(m.score * 100);
      let s = 'ok';
      if (ms >= 70) s = 'bad'; else if (ms >= 40) s = 'warn';
      return { s, t: `${m.name}: ${m.status} (${ms}/100)` };
    });
  if (!signals.length) {
    signals.push({ s: band === 'green' ? 'ok' : band === 'red' ? 'bad' : 'warn',
                   t: `Reality Defender overall verdict: ${rd.status}` });
  }

  return {
    name: filename, role: 'Uploaded file', kind: 'Live Reality Defender analysis',
    band, score, title: titleMap[band], sub: `Reality Defender status: ${rd.status}`,
    signals, rec: recMap[band], engine: 'realitydefender',
  };
}

// Access-gate middleware: if ACCESS_CODE is set, require it on protected routes.
function requireAccess(req, res, next) {
  if (!ACCESS_CODE) return next();                       // open instance
  const given = req.get('x-access-code') || '';
  if (given === ACCESS_CODE) return next();
  return res.status(401).json({ error: 'bad_code', message: 'Invalid or missing access code.' });
}

// Real detection endpoint.
app.post('/api/analyze', requireAccess, upload.single('file'), async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ error: 'no_api_key',
      message: 'Set RD_API_KEY in server/.env to enable real detection.' });
  }
  if (!req.file) return res.status(400).json({ error: 'no_file' });

  // Protect the free quota.
  if (scanCount >= MAX_MONTHLY_SCANS) {
    fs.unlink(req.file.path, () => {});
    return res.status(429).json({ error: 'quota',
      message: `Monthly scan limit reached (${MAX_MONTHLY_SCANS}). Resets next month, or upgrade the Reality Defender plan.` });
  }

  const filePath = req.file.path;
  const candidate = (req.body?.candidateName || '').toString().trim().slice(0, 80);
  try {
    bumpScan();
    const realityDefender = new RealityDefender({ apiKey: API_KEY });
    // Two-step + poll: detect() can throw while some models are still ANALYZING,
    // so we upload, then poll getResult() until the models settle (or we time out).
    const { requestId } = await realityDefender.upload({ filePath });
    let result = await realityDefender.getResult(requestId);
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline &&
           (result.models || []).some(m => m.status === 'ANALYZING')) {
      await new Promise(r => setTimeout(r, 3000));
      result = await realityDefender.getResult(requestId);
    }
    const mapped = mapResult(result, req.file.originalname);
    if (candidate) mapped.name = `${candidate} — ${req.file.originalname}`;
    mapped.scansLeft = Math.max(0, MAX_MONTHLY_SCANS - scanCount);
    res.json(mapped);
  } catch (err) {
    console.error('detect failed:', err?.message || err);
    res.status(502).json({ error: 'detect_failed', message: err?.message || String(err) });
  } finally {
    fs.unlink(filePath, () => {});   // never keep candidate media
  }
});

// Lets the frontend show whether real detection is live + whether a code is needed.
app.get('/api/status', (_req, res) => res.json({
  ok: true,
  configured: !!API_KEY,
  requiresCode: !!ACCESS_CODE,
  scansLeft: Math.max(0, MAX_MONTHLY_SCANS - scanCount),
}));

// Lets the gate screen validate a code without uploading a file.
app.get('/api/verify-code', requireAccess, (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n  TrueHire →  http://localhost:${PORT}\n`);
  console.log(API_KEY
    ? '  ✓ Reality Defender API key loaded — uploads use REAL detection.'
    : '  ⚠ No RD_API_KEY set — uploads fall back to demo mode. Add it to server/.env');
  console.log(ACCESS_CODE
    ? `  ✓ Access gate ON — pilots need the code. Quota guard: ${MAX_MONTHLY_SCANS}/mo.\n`
    : `  ⚠ Access gate OFF (no ACCESS_CODE) — anyone with the URL can spend scans. Quota guard: ${MAX_MONTHLY_SCANS}/mo.\n`);
});
