# Docs — Deepfake Detection Venture: Research & Plan

Research, fact-check, and the working plan for a bootstrapped startup in deepfake detection — focused on the **hiring/recruiting deepfake-fraud** wedge.

**Last updated:** 2026-06-19

## How to read this

- **Part 1 (01–05):** fact-check of the original venture thesis — what's true, what's not.
- **Part 2 (06–11):** the chosen wedge (hiring-fraud detection) — research, product, plan, demo spec, roadmap.

## Index

### Part 1 — Thesis Fact-Check
| File | What's in it |
|---|---|
| [01-factcheck-report.md](01-factcheck-report.md) | The verdict on the original thesis — accurate / misleading / refuted / unverified + fixes. |
| [02-detailed-findings.md](02-detailed-findings.md) | Claim-by-claim evidence with vote records and source links. |
| [03-sources.md](03-sources.md) | All 28 sources, grouped by angle, with quality tags. |
| [04-original-thesis.md](04-original-thesis.md) | The original thesis, preserved verbatim. |
| [05-raw-research-data.json](05-raw-research-data.json) | Raw deep-research output (thesis fact-check). |

### Part 2 — The Hiring-Fraud Wedge (the actual plan)
| File | What's in it |
|---|---|
| [07-wedge-research.md](07-wedge-research.md) | **Start here for the business.** Verified deep-dive: problem, competitors, rentable detection APIs + prices, pricing model, regulation, failure modes. |
| [08-product-and-plan.md](08-product-and-plan.md) | Product vision, user flow, who buys, and the 4–6 week demo-led discovery plan. |
| [09-demo-build-spec.md](09-demo-build-spec.md) | Exactly what the 1–2 week "wow" demo contains — scope, scenarios, engine, report format. |
| [10-roadmap.md](10-roadmap.md) | Future roadmap: demo → paid pilots → SaaS → in-workflow → platform; where the moat forms. |
| [06-interview-kit.md](06-interview-kit.md) | Customer-discovery kit: outreach templates, 15-question script, scoring, decision gate. |
| [11-wedge-raw-data.json](11-wedge-raw-data.json) | Raw deep-research output (wedge). |

## The Decision So Far

- **Is the problem real?** Yes — verified by independent anchors (Gartner: 25% of candidate profiles could be fake by 2028; DOJ: North Korean IT-worker scheme hit 300+ U.S. companies).
- **The bet:** NOT general deepfake detection (arms race, funded incumbents). The wedge is **hiring/recruiting deepfake-fraud detection** for **SMB/mid-market** — a workflow/integration play, not a detection-tech play.
- **Who buys:** companies (B2B), recruiter- or security-led. Not individuals.
- **Form:** a SaaS web tool → in-workflow (live + ATS) → platform/API.
- **Approach:** rent the detection engine (Reality Defender free tier, AWS Liveness ~$0.015/check); win on workflow, audit trail, niche focus, price.
- **Caution:** the wedge is **not greenfield** (GetReal Security is a direct incumbent) and **BIPA biometric-privacy law is an existential legal risk** — design consent + human-in-the-loop from day one.
- **Next action:** build the 1–2 week demo + run demo-led discovery → gate on 3–4 paid-pilot commitments before building the real product.

## Open Questions / Next Research

1. Budget owner (HR vs CISO), real deal sizes, sales-cycle length for hiring-fraud detection.
2. Accuracy / false-positive rates of rentable APIs on *live injected* deepfakes vs GetReal's purpose-built engine.
3. Full multi-state compliance map (Texas CUBI, Washington, Colorado AI Act, EEOC) beyond BIPA + NYC LL144.
4. Whether white-label/reseller terms exist from Reality Defender / Sumsub / AWS (only "integrate" confirmed).

> Method: two deep-research workflow runs — 11 angles, 51 sources, 212 claims extracted, 50 adversarially verified, 216 sub-agents total.
