> ⚠️ **Superseded for the MVP.** The app now has a database + accounts. Use **`16-setup-and-keys.md`** as the authoritative setup/deploy guide. This file is kept for the earlier (pre-database) version.

# Deploy Guide — Putting the Pilot App Online

> Goal: a private URL you can give Sendil and other interested leads, where they run **real** candidate checks behind an access code. ~20 min.
> The app is the **Next.js app in `/web`**. (The older `/server` + `/demo` prototype still works but `/web` is the go-forward product.)
> **Updated:** 2026-06-20

---

## ⚠️ Two safety rules first
1. **Use a PRIVATE GitHub repo.** Your `docs/` folder has your business strategy and research — do NOT make it public. A private repo keeps it safe and still deploys fine.
2. **Never commit secrets.** Your API key lives in `web/.env.local`, which is git-ignored. On the host you set it as an environment variable instead (steps below).

---

## What "hosted v1" gives you
- A real URL (e.g. `truehire.vercel.app`) you can share.
- **Access gate:** users must enter a code you set → randoms can't burn your 50 free scans.
- **Quota guard:** detection auto-stops at `MAX_MONTHLY_SCANS` (default 45).
- Real Reality Defender detection on uploaded files + a candidate-name field on the report.

---

## Step 1 — Put the code on GitHub (one time)
The project isn't a git repo yet. In the project root (`X:/deep-fake`):
```bash
git init
git add .
git commit -m "TrueHire pilot v1 (Next.js)"
```
Create a **private** repo on github.com, then:
```bash
git remote add origin https://github.com/<you>/truehire.git
git branch -M main
git push -u origin main
```
> Check before pushing: `git status` must NOT list `web/.env.local` or `server/.env`. If it does, stop — the `.gitignore` isn't being picked up.

---

## Step 2 — Deploy

### Option A — Vercel (recommended for Next.js, free, no card)
1. Go to [vercel.com](https://vercel.com) → sign up with GitHub → **Add New… → Project**.
2. Import your repo. Vercel auto-detects Next.js. **Set the Root Directory to `web`** (important — the app lives in the `web/` subfolder).
3. Under **Environment Variables**, add:
   - `RD_API_KEY` → your Reality Defender key
   - `ACCESS_CODE` → a code you invent (e.g. `pilot-2026`) — this is what you give pilots
   - `MAX_MONTHLY_SCANS` → `45`
4. **Deploy.** You get a URL like `https://truehire.vercel.app`.

> ⚠️ On Vercel (serverless) the scan counter is a *soft* per-instance guard — the access code is your real protection against overspend. For a strict hard cap, use Option B.

### Option B — Render (single instance = strict quota guard)
1. [render.com](https://render.com) → **New → Web Service** → connect the repo.
2. Set **Root Directory** = `web`, **Build** = `npm install && npm run build`, **Start** = `npm start`.
3. Add the same 3 env vars as above.
4. Create. You get a `…onrender.com` URL. (Free instances sleep after inactivity; first load takes ~30s.)

---

## Step 3 — Share it
Send pilots the URL + the access code:
> Here's the early access link: https://truehire.vercel.app — access code: `pilot-2026`. Drop in a candidate photo or voice clip and it flags deepfake/manipulation risk. Takes a few seconds.

---

## After it's live — test it yourself once
1. Open the URL → you should see the **access gate**. Enter your code.
2. Badge turns green: "Live detection connected."
3. Upload a real selfie (🟢) and an AI face from `thispersondoesnotexist.com` (🔴) — that contrast is your proof.
4. Watch "scans left this month" tick down. At 45 it stops (safety), leaving headroom under the 50 free.

## Run locally (unchanged)
```bash
cd web
npm run dev          # http://localhost:3000
```
Set `ACCESS_CODE` in `web/.env.local` to test the gate locally; leave blank for open local testing.

## When pilots love it and 50 scans isn't enough
That's the good problem. Upgrade the Reality Defender plan, raise `MAX_MONTHLY_SCANS`, and (on Vercel) move the counter to a small DB/Redis for a strict cross-instance cap. Pilots hitting the cap = real usage = the signal that says "keep building."
