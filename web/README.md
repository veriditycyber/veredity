# TrueHire — Web App (Next.js + Database)

The product MVP. Replaces the earlier `../server` + `../demo` prototype (safe to delete once you're happy with this).

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Backend = Next.js Route Handlers** (`app/api/*`) — no separate server
- **Database = Prisma + SQLite** (a local file; one-line switch to Postgres for prod — see `../docs/16-setup-and-keys.md`)
- **Auth** — email + password, bcrypt-hashed, secure http-only session cookies (hand-rolled in `lib/auth.ts`)
- **Reality Defender** for real detection (`upload` + poll `getResult`)

## Run locally
```bash
cd web
npm install                  # first time only
npx prisma db push           # first time only — creates the SQLite DB
npm run dev                  # http://localhost:3000
```
The `.env.local` already has your `RD_API_KEY`, `AUTH_SECRET`, and `DATABASE_URL`. Sign up in the UI and you're in.

### Env vars
| Var | Meaning |
|---|---|
| `DATABASE_URL` | DB connection (`file:./dev.db` locally; Postgres URL in prod) |
| `AUTH_SECRET` | Random secret for sessions (`openssl rand -hex 32`) |
| `RD_API_KEY` | Reality Defender key — required for real detection |
| `MAX_MONTHLY_SCANS` | Safety cap (default 45) so you never exceed the free 50/mo |

## Structure
- **Auth:** `app/(auth)/login`, `app/(auth)/signup` · `app/api/auth/{signup,login,logout}` · `lib/auth.ts`
- **App (gated):** `app/(app)/layout.tsx` (session guard + sidebar) → `dashboard`, `check`, `history`, `history/[id]`, `settings`
- **Detection API:** `app/api/upload` (auth + quota → RD upload → create Check row) · `app/api/result` (poll RD → save verdict) · `app/api/status`
- **Data:** `prisma/schema.prisma` (User, Session, Check) · `lib/db.ts` · `lib/usage.ts`
- **Detection logic:** `lib/rd.ts` (isolated — can move to a standalone service later)
- **UI:** `components/` (Sidebar, Topbar, CheckFlow, VerdictCard, Badge, icons)

Detection thresholds (risk 0–100): **≥70 red, 40–69 yellow, <40 green** — tune in `lib/rd.ts`.

## What's persisted
- **Users & sessions** (login).
- **Checks** — every real candidate scan becomes a `Check` row (candidate, file, band, score, signals, status) → the **History / audit trail**.
- Monthly scan quota is computed from the DB (accurate, not in-memory).

## Deploy
See **`../docs/16-setup-and-keys.md`** (recommended: Vercel + Neon Postgres) and the user flow in `../docs/15-user-flow.md`.
