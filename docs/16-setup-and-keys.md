# TrueHire — Setup, API Keys & Infrastructure

> Everything you need to provide/configure. Split into **already done**, **to run locally**, and **to deploy**.
> **Generated:** 2026-06-20

---

## ✅ Already done (no action needed)
| Item | Status |
|---|---|
| Reality Defender API key | Set in `web/.env.local` (your key). Free tier = 50 scans/month. |
| `AUTH_SECRET` (session signing) | Generated and set. |
| Database (local) | SQLite file `web/prisma/dev.db` — created, schema applied. **No external DB service needed locally.** |
| App code | Auth, dashboard, checks, history, settings — built and tested end-to-end. |

---

## ▶️ To run it locally (right now)
```bash
cd web
npm run dev          # http://localhost:3000
```
Sign up → you're in. Uploads run real Reality Defender detection and save to your history. **Zero extra setup.**

---

## 🚀 To deploy (when ready) — what YOU need to do

You need **3 things**: a host, a production database, and the env vars. Pick a path:

### Path A — Vercel + Neon Postgres (recommended; scalable, free tiers)
SQLite is a local file, so for a real hosted app use a hosted database.

1. **Create a free Postgres database** at **[neon.com](https://neon.com)** (or supabase.com). Copy the connection string (looks like `postgresql://user:pass@host/db`).
2. **Switch Prisma to Postgres** (one line): in `web/prisma/schema.prisma`, change
   `provider = "sqlite"` → `provider = "postgresql"`.
3. **Push the schema** to Neon:
   ```bash
   cd web
   # put the Neon URL in .env temporarily, then:
   npx prisma db push
   ```
4. **Deploy on [vercel.com](https://vercel.com):** Import your (private) GitHub repo → set **Root Directory = `web`** → add the env vars below → Deploy.

### Path B — Railway / Fly (keep SQLite, needs a volume)
If you'd rather not run Postgres: deploy on a host with a **persistent disk** (Railway or Fly.io), mount it where `dev.db` lives, set the env vars. Simpler DB, but the host must support volumes (Vercel does not persist files).

> **Recommendation:** Path A. It's the standard, scales, and keeps the Vercel setup. Neon's free tier is plenty for pilots.

### Env vars to set on the host (both paths)
| Var | Value |
|---|---|
| `DATABASE_URL` | Neon Postgres URL (Path A) or your SQLite path (Path B) |
| `AUTH_SECRET` | a random 64-char hex — run `openssl rand -hex 32` (or reuse the one in `.env.local`) |
| `RD_API_KEY` | your Reality Defender key |
| `MAX_MONTHLY_SCANS` | `45` |

---

## 🔑 The accounts/keys you'll touch
| Service | Why | Cost | You need to |
|---|---|---|---|
| **Reality Defender** | Deepfake detection engine | Free tier (50/mo) | ✅ Already have a key. Upgrade when pilots exceed 50/mo. |
| **GitHub** (private repo) | Source + deploy trigger | Free | Create a **private** repo, push the project. |
| **Vercel** (or Railway/Fly) | Hosting | Free tier | Sign up, import repo, set env vars. |
| **Neon** (Path A) | Production database | Free tier | Create a DB, copy the connection string. |

---

## 🔮 Later (not needed for the pilot)
- **Custom domain** (e.g. `app.truehire.io`) — add in Vercel once you pick a name.
- **Email provider** (Resend/Postmark) — for password reset & candidate-invite emails. Not in the MVP (sign-up uses email+password directly).
- **Redis / Postgres counter** — for a strict cross-instance scan cap at scale (the current monthly cap is computed from the DB, which is already accurate on a single database).
- **AWS Rekognition** — to add liveness/face-match alongside Reality Defender (catches presentation/injection spoofs).

---

## 🔒 Security notes (already implemented)
- Passwords hashed with **bcrypt**; sessions are random tokens in **http-only, secure** cookies.
- Uploaded media is sent to the engine and **deleted immediately** — never stored at rest.
- **Consent required** before every biometric check (BIPA-aligned).
- The API key lives only on the server (env var) — never exposed to the browser.
- `.env*` and `*.db` are git-ignored — secrets and user data never get committed.
