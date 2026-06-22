# Product Roadmap — Now / Next / Later

> One page on where the product is and where it goes. Detection is rented; the moat is the layers around it.
> **Generated:** 2026-06-22

---

## The vision
A **trust layer for remote hiring** — wired into the hiring stack, automatically verifying every candidate's identity and flagging deepfake / impersonation / AI-fronted fraud, with a compliance-grade audit trail. Later, widen into identity trust for any high-stakes remote interaction.

## The moat (not the detector)
Detection is a rented commodity (Reality Defender). Defensibility compounds from:
1. **Workflow fit** — lives where recruiters already work
2. **Audit trail / compliance** — the record regulated buyers need
3. **Integrations** — once in their hiring stack, it's sticky
4. **Vertical focus** — *the* hiring-fraud option, not a general tool

---

## NOW — Stage 1 (built; finish operationally)
*Status: feature-complete, tested locally. Remaining work is deploy + harden, not features.*
- ✅ Accounts & secure auth
- ✅ Candidate checks → real Reality Defender detection → green/yellow/red + score + signals
- ✅ History / audit trail + PDF report
- ✅ Dashboard, consent + quota guards, security UI
- ⏳ **Deploy** (Neon Postgres + Vercel)
- ⏳ **Harden** (Postgres, connection pooling, rate limiting, validation, logging)

**Gate to Next:** a few pilots actually using it (Sendil & co.) — they tell us *what* to build next.

## NEXT — Stage 2 (the sticky leap)
*Turns "upload a file" into "part of the interview."*
- **Live interview monitoring** — a companion that joins Zoom/Teams/Meet and flags deepfakes in real time *(this is where a dedicated real-time backend, e.g. Go, earns its place)*
- **Candidate pre-verification link** — identity + liveness check before the interview
- **First ATS integration** — Greenhouse / Lever / Workable, so checks fire automatically
- **Team accounts** — multiple recruiters per company, shared history

**Gate to Later:** retained paying customers + a clear, repeatable buyer.

## LATER — Stage 3 (the platform)
- **Public API + ATS-marketplace** listings (distribution)
- **Multi-modal detection** — add AWS liveness/face-match + voice-clone alongside Reality Defender
- **Threat intelligence** — flag known North-Korea / persona-fraud networks
- **Compliance tooling** — bias-audit + multi-state coverage as a selling point
- **Self-serve billing** + plans

---

## What gates progress
The product roadmap is clear; **validation gates it, not engineering.** Pilots paying (or committing) is the signal to build Stage 2 — and *what* to build first. Keep talking to buyers; build to fulfil real demand, not on spec.
