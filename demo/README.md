# TrueHire — Demo

A self-contained "wow" demo for the hiring deepfake-detection wedge. Built to **show recruiters/security buyers in interviews**, not for production.

> **TrueHire** is a placeholder name — rename freely (edit the `<title>` and the two `logo` blocks in `index.html`).

## How to run it
**Just double-click `index.html`** — it opens in your browser. No server, no install, no API key, no internet needed. You can also email the single file or drop it on any static host (Netlify/Vercel/GitHub Pages) to get a shareable link.

## How to demo it (the 60-second story)
1. Pick **Alex Morgan** → click *Analyze* → 🟢 "Likely genuine."
2. Pick **Jordan Lee** → 🔴 "High risk — likely deepfake" with face-swap signals.
3. Pick **Sam Rivera** → 🟡 "Inconclusive — human review needed" (shows the honest, human-in-the-loop design — a selling point).
4. Optional: **Casey Kim** → 🔴 synthetic *voice* (shows multi-modal).
5. Hit **Download report (PDF)** to show the audit trail (uses your browser's Print → Save as PDF).

The **consent checkbox** is intentional — it signals you take BIPA/biometric law seriously, which enterprise-minded buyers care about.

## Two ways to run it
- **Static (double-click `index.html`):** sample candidates are scripted; "upload your own" shows a labeled placeholder. Zero setup — best for showing people quickly.
- **Real detection (run the backend in `../server`):** open `http://localhost:3000` and the badge turns green — **uploaded files are scored by the real Reality Defender API.** See `../server/README.md` for the 3-step setup (free API key → `.env` → `npm start`).

## What's real vs. scripted (be honest if asked)
- **Sample results are pre-scripted** so the live demo never breaks. That's normal for a prototype, and it's how you tell a clean 60-second story.
- **"Drop your own"** runs **real Reality Defender detection** when the backend is running; without it, a clearly-labeled placeholder.
- **Why a backend at all:** an API key can't live safely in a browser (anyone could steal it) and browsers block direct calls to detection engines (CORS). The server holds the key and makes the call.

## Don't over-build this
If you find yourself adding accounts, billing, or real-time video — stop. That's the *product* (Stage 1+), not the demo. The demo's only job is to make a buyer say *"when can I try this on my candidates?"* Then you make the paid-pilot ask.

See `../docs/09-demo-build-spec.md` for the full spec and `../docs/08-product-and-plan.md` for the plan.
