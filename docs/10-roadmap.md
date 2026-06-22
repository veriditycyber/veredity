# Future Roadmap — From Demo to Defensible Business

> How this grows from a 1-week demo into a real company, and where the moat forms. Grounded in `07-wedge-research.md` + `08-product-and-plan.md`.
> **Generated:** 2026-06-19

---

## The arc in one line

**Demo → paid pilots → thin SaaS web tool → in-workflow (live + ATS) → platform/API.** Each stage earns the right to the next by being *paid for* first.

---

## Stage 0 — Demo + Discovery  *(Weeks 1–6)*
- **Build:** the 1–2 week "wow" demo (`09-demo-build-spec.md`).
- **Do:** problem-first interviews + demo reveal + paid-pilot ask (`08-product-and-plan.md`).
- **Moat:** none yet — you're buying *evidence*, not building tech.
- **Gate to advance:** 3–4 paying pilot commitments.

## Stage 1 — Thin SaaS Web Tool (MVP)  *(Months 2–4)*
- **Build:** the real version of the demo for your pilots:
  - accounts, a candidate-check flow (upload OR send candidate a verification link),
  - automated green/yellow/red report + PDF audit trail,
  - per-check billing (Stripe), consent flow baked in.
- **Engine:** integrate Reality Defender / AWS Liveness / Resemble under your own account (per-check cost = cents).
- **Sell:** per-check pricing, self-serve, to SMB/mid-market recruiters & security teams.
- **Moat (forming):** workflow simplicity + audit trail + niche focus + your early-customer relationships. Still thin.
- **Gate to advance:** pilots convert to paying retained customers; repeatable acquisition channel found.

## Stage 2 — In-Workflow: Live + ATS  *(Months 4–9)*
- **Build:**
  - **Live interview companion** — a bot/extension that joins Zoom/Teams/Meet and flags in real time (this is GetReal's core — match it for your segment).
  - **Candidate pre-verification** step (identity + liveness before the call).
  - **First ATS integration** (Greenhouse / Lever / Workable) so checks fire automatically.
- **Moat (real now):** you live *inside* their hiring workflow. Switching cost rises. The audit trail becomes a compliance system of record.
- **Gate to advance:** customers rely on it per-interview; integrations drive retention; clear ICP.

## Stage 3 — Platform + API + Distribution  *(Months 9–18+)*
- **Build:**
  - public **API** so others embed your check,
  - native **ATS marketplace** listings (distribution),
  - **partnerships** with background-check firms (Checkr-type) — you become a feature in their flow,
  - North-Korea / persona-network **threat intelligence** layer (matches GetReal's enterprise hook),
  - bias-audit + multi-state compliance tooling as a *selling point*.
- **Moat (durable):** workflow lock-in + integrations + compliance + brand in a narrow vertical. Hard to rip out.
- **Outcome:** a real recurring-revenue B2B SaaS — acquirable by an ATS, background-check, or IDV company, or a standalone niche leader.

---

## Where the moat actually comes from (not the detector)

Detection is a rented commodity — it is **never** your moat. Defensibility compounds from:
1. **Workflow integration** (ATS-native, lives where they work).
2. **Audit trail / compliance** (the record regulated buyers need).
3. **Vertical focus + trust** (you're *the* hiring-fraud option for your segment).
4. **Distribution partnerships** (background-check + ATS channels).
5. **Proprietary signal over time** (your own labeled data on hiring-specific fraud patterns — only after volume).

## Risks to manage at each stage (from research)

| Risk | When it bites | Mitigation |
|---|---|---|
| **BIPA / biometric liability** | The moment you process real biometric data (Stage 1) | Consent flows, limit Illinois, minimize data retention, lean on vendor processing, get legal review before Stage 1 launch. |
| **Bias-law (NYC LL144 etc.)** | When perceived as an "employment decision tool" | Human-in-the-loop; position as fraud/security signal; be ready for bias-audit asks. |
| **Incumbent (GetReal) / IDV giants moving in** | Throughout | Stay narrower, cheaper, faster, SMB-focused than they bother to be; win the segment they ignore. |
| **Detection = commodity** | Stage 1+ | Compete on workflow/compliance, never on raw model accuracy. |
| **False positives** | Any stage | Human-in-the-loop; conservative thresholds; never auto-reject a candidate. |

## Next research / validation to commission

- Real **deal sizes, sales-cycle length, and budget owner** (HR vs CISO) for hiring-fraud detection.
- **Accuracy / false-positive rates** of the rentable APIs on *live injected* deepfakes — is reselling defensible vs GetReal?
- **Full multi-state compliance map** (Texas CUBI, Washington, Colorado AI Act, EEOC).
- Whether **white-label/reseller** terms are available from Reality Defender / Sumsub / AWS (only "integrate" is confirmed today).
