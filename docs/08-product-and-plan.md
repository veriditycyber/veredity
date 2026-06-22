# Product Vision, User Flow & The Plan (Now)

> What we're building, who buys it, what form it takes, and the concrete near-term plan. Grounded in `07-wedge-research.md`.
> **Generated:** 2026-06-19

---

## Product Vision

> **A trust layer for remote hiring.** It verifies a candidate is a real, consistent human — not a deepfake, impersonator, or AI-fronted identity — before and during the interview, and hands the recruiter a simple **green / yellow / red** signal plus a compliance-grade audit trail. We rent the detection engine; we win on workflow fit, narrow focus, and being the easy, affordable, hiring-specific option.

**Positioning vs. GetReal (the incumbent):** they go enterprise, deep, and sell to security teams. We go **SMB / mid-market, simple, self-serve, and recruiter-first** — the segment they neglect. Same problem, underserved buyer.

## The Three Core Answers

| Question | Answer |
|---|---|
| **Sell to individuals or companies?** | **Companies (B2B).** A solo recruiter can be the self-serve entry point, but money + renewal come from the company. Individuals don't have a recurring need. |
| **Website, workflow, or tool?** | **All three, in sequence.** Starts as a **web tool (SaaS)** → becomes a **workflow** embedded in their hiring stack → ends as a **platform/API** wired into the ATS. |
| **What is it?** | A hiring identity-fraud / deepfake detection **service** with a green/yellow/red signal + audit report. Human-in-the-loop: *we flag, the recruiter decides.* |

## User Flow (Stage 1–2 Product)

**Recruiter / company side:**
1. Sign up (self-serve) → optionally connect calendar / ATS.
2. Before an interview: candidate gets a link → quick identity + liveness check (selfie + ID or live face-match). **Consent captured here.**
3. During the video interview: tool watches the stream for face-swap / voice-clone / injection signals.
4. Recruiter sees a live **green / yellow / red** indicator.
5. After: an automated **report** — risk score, what was flagged, evidence, stored for audit.
6. Flagged → recruiter escalates / re-verifies. Clean → proceed. **Human always decides.**

**Candidate side (keep frictionless — 30–60 sec):**
- One short verification step. Too much friction → good candidates drop off → recruiters stop using it. This is a hard design constraint *and* where consent/bias law lives.

## Go-to-Market

- **Who pays:** Companies hiring remotely. Start **SMB / mid-market**: tech companies hiring remote engineers (the North Korea angle — scary, budgeted, security cares), staffing agencies, remote-first firms.
- **Entry buyer:** Head of Talent Acquisition / Recruiting, or Security at firms worried about insider threat. (Open question: which holds budget — resolve in interviews.)
- **Channel:** Direct/self-serve first (LinkedIn, recruiting communities, content). Later: **partnerships** with background-check firms + ATS marketplaces as distribution.
- **Pricing:** **Per-check** to start (cost is cents/check; sell for $5–25 → huge margin). Move to per-seat / tiered subscription as you enter the workflow.

---

# The Plan (Now) — Demo-Led Discovery

> Strategy: **convincing demo, not a full beta.** Show something real in interviews, ask for *money* (paid pilot) at the end, build the real product only for people who paid. ~4–6 weeks, near-zero cost.

### Phase A — Build the demo (Week 1–2)
- A thin web screen: takes a sample interview clip / candidate video → returns a **green/yellow/red risk report**.
- Under the hood: **Reality Defender free tier (50/month)** + **AWS Face Liveness** on a few canned examples. Smoke-and-mirrors, but real-looking. (See `09-demo-build-spec.md`.)
- Goal: something impressive to reveal at the end of an interview — *not* a production product.

### Phase B — Problem-first interviews (Week 2–4, runs in parallel)
- Use `06-interview-kit.md`. **Do not pitch.** Ask about past incidents, current verification spend, severity.
- Find buyers via LinkedIn DMs + recruiting/security communities (templates in the kit).
- Optional media: post the problem, drive to a landing page with a real "get early access — $X" button (counts payment intent, not likes).

### Phase C — Reveal the demo + make the money ask (end of each interview)
- *"Here's a rough version of what I'm building — honest reaction?"* (the earned "wow" moment).
- Then: *"I'm onboarding a few paid pilots at $X. Want in?"* → **a pre-order / card on file is the real signal.** Enthusiasm is free.

### Phase D — Decision gate (Week 4–6)
- Target: **3–4 buyers who (a) named a real incident, (b) already pay for verification/background checks, (c) said yes to a paid pilot.**
- ✅ Hit it → build the thin Stage-1 product *for those specific pilots* (see roadmap).
- ❌ Miss it → switch buyer segment (security vs HR), or switch wedge (marketplace trust, SMB KYC, voice/contact-center). You've spent ~6 weeks and ~$0.

### Guardrails (from the research)
- **Build consent into the demo flow** even for canned examples — BIPA is existential. Habit starts now.
- **Frame as a fraud/security signal with human-in-the-loop**, never an "automated hiring decision" — reduces bias-law exposure.
- **Lead the pitch with Gartner (25% by 2028) + DOJ (North Korea, 300+ companies)** — the independent anchors — not vendor stats.
- Consider **excluding Illinois** from any real (non-demo) processing until you have proper consent/legal cover.
