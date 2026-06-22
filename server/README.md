# TrueHire Backend — Real Deepfake Detection

This turns the static demo into a working app: uploaded files are scored by the **real Reality Defender API**. (The 4 sample candidates stay scripted on purpose — they're for a reliable live-demo story that never breaks.)

## What you get
- **Two modes, one UI:**
  - Open `demo/index.html` directly (double-click) → static demo, uploads use a labeled placeholder. Good for showing people with zero setup.
  - Run this server → open `http://localhost:3000` → **uploads run real Reality Defender detection.** The badge turns green: *"Live detection connected."*

## Setup (one time)

1. **Get a free Reality Defender API key** (50 image/audio scans per month):
   https://app.realitydefender.ai/settings/manage-api-keys

2. **Add the key.** In this `server/` folder, copy the template and paste your key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set:
   ```
   RD_API_KEY=your-key-here
   ```

3. **Install dependencies** (already done if you ran it once):
   ```bash
   npm install
   ```

## Run

```bash
npm start
```
Then open **http://localhost:3000** in your browser.

- If the key is set, the console prints `✓ Reality Defender API key loaded` and uploads use real detection.
- If not, it prints a warning and uploads fall back to demo mode (still fully usable for showing the flow).

## Pilot options (env vars)
Set these in `.env` (local) or your host's dashboard (deployed):

| Var | What it does |
|---|---|
| `RD_API_KEY` | Your Reality Defender key. Required for real detection. |
| `ACCESS_CODE` | If set, users must enter this code (a gate screen) before running a check — stops random visitors burning your free scans. Leave blank = open. |
| `MAX_MONTHLY_SCANS` | Safety cap (default 45). Detection auto-stops once this many scans run in a month, protecting the free tier (50/mo). |

## How it works
- `server.js` serves the `demo/` UI and exposes:
  - `POST /api/analyze` — gated by `ACCESS_CODE`, capped by `MAX_MONTHLY_SCANS`. Uploads the file to Reality Defender (`upload` + poll `getResult` until models settle), maps the result (`status` + `score` 0–1 + per-model breakdown) into the green/yellow/red report, optionally labels it with a candidate name, and **deletes the file immediately** (no candidate media is stored).
  - `GET /api/status` — tells the UI whether detection is live, whether a code is required, and scans left.
  - `GET /api/verify-code` — lets the gate screen validate a code.
- Detection thresholds (risk score 0–100): **≥70 red, 40–69 yellow, <40 green.** Tune in `mapResult()` in `server.js`.

## Deploying for pilots
See **`../docs/14-deploy-guide.md`** for the full Render / Railway walkthrough (private repo, env vars, access code).

## Notes & limits
- **Free tier = image + audio.** Video may not be supported on the free tier yet — check your plan. The UI accepts video but RD may reject it.
- **The API key lives only on the server** (in `.env`, which is git-ignored) — never in the browser. This is why a backend is required at all.
- **This is still pre-product.** It proves real detection works. The actual product (accounts, billing, live-interview monitoring, ATS integration) is Stage 1+ in `../docs/10-roadmap.md`.
- Reality Defender SDK reference: https://docs.realitydefender.com/sdks/quickstart
