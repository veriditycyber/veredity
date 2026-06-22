# Wedge Deep-Dive — Hiring/Recruiting Deepfake Fraud Detection

> Verified research on the chosen wedge. Method: 5 angles, 23 sources, 103 claims extracted, 25 verified (3-vote adversarial), 6 synthesized findings. 105 sub-agents.
> **Generated:** 2026-06-19

---

## TL;DR

The wedge is **real, growing, and has a working supply chain** — but it is **not greenfield** (a funded hiring-specific incumbent exists) and carries a **serious legal risk** (biometric privacy law). The opportunity for a bootstrapper is a **workflow/integration play**, not a detection-tech play: you rent the detection engine and win on being narrow, fast, ATS-native, and compliance-aware.

---

## 1. The Problem — Is it real? ✅ Yes (independently verified)

| Anchor | Stat | Source quality |
|---|---|---|
| **Gartner** | By **2028, 1 in 4 (25%)** candidate profiles globally could be fake. 6% of 3,000 candidates (2Q25) admitted to interview impersonation fraud. | **Independent forecast** (strongest anchor) |
| **DOJ / FBI / Treasury** | North Korean IT-worker scheme: **300+ U.S. companies** unknowingly hired NK-linked impostors using stolen identities, ≥$6.8M, funding weapons programs. Hit Fortune 500 + a defense company. | **Government-measured** (strongest anchor) |
| Resume Genius (survey of 1,000 hiring managers) | **~17%** report encountering deepfake video interviews. | Vendor-adjacent survey |
| Experian 2026 Fraud Forecast | Names deepfake job candidates passing interviews in real time as a top escalating threat; predicts employers unknowingly onboarding fraudulent identities. | Vendor (IDV) forecast |

**Verdict:** The two strongest data points (Gartner, DOJ) are independent of any vendor selling a solution — that's what makes this pain credible rather than manufactured. The North Korea angle is the sharpest wedge: it's scary, specific, *budgeted*, and security teams (not just HR) care.

> ⚠️ **Caveat:** Most of the louder stats (41% hired a fraudulent candidate, 88% encounter deepfakes, 84% recruiters saw fraud) come from **vendors who sell detection** (notably GetReal). Cite them as vendor surveys, and note they bundle broad categories ("deepfake OR impersonation" includes ordinary phishing). Don't build your pitch on these — build it on Gartner + DOJ.

## 2. Competitors — Not greenfield ⚠️

| Competitor | What they do | Implication for you |
|---|---|---|
| **GetReal Security** | **Direct competitor.** Purpose-built staffing/recruiting product: continuous real-time face + voice verification *during* live interviews, ATS + video-interview integration, North-Korea-network threat intel. Funded. | This is your benchmark. You **cannot** beat them on detection tech. You beat them on niche focus, price, simplicity, and self-serve SMB (they chase enterprise). |
| **Persona** | IDV giant with a candidate-verification solution; blocked 75M+ AI face-spoof attempts (full-year 2024). | Enterprise/platform-scale. Strong brand. Not focused purely on the live-interview moment. |
| **Sumsub** | IDV incumbent expanding *toward* hiring (research refuted the idea that they ignore this wedge). | They're a supplier you can build on AND a competitor moving in. Move fast. |
| Background-check firms (Checkr, etc.) | Adding identity/deepfake checks to existing checks. | Distribution threat — but also a *partnership* channel later. |

**Strategic read:** Detection is a commodity. The defensible layer is **workflow + integration + compliance + a sharp vertical focus.** Your edge as a bootstrapper is *speed, narrowness, and SMB self-serve* — the part incumbents neglect.

## 3. Detection APIs You Can Rent (the supply chain) ✅ Mature & self-serve

You do **not** build a detection model. You integrate one of these:

| API | What it detects | Pricing (public, re-verify before relying) | Free tier? |
|---|---|---|---|
| **Reality Defender API** | Deepfake (audio/image; video pending), ~2 lines of code | **Free tier: 50 detections/month** | ✅ Yes — best for the demo |
| **AWS Rekognition Face Liveness** | Presentation, injection/synthetic-deepfake bypass, 3D-mask spoofs | **~$0.015/check** (first 500K), down to $0.010 | Low/no minimum |
| **Sumsub** | Full IDV: ID verification + Liveness + Face Match (Basic); +AML (Compliance) | **Basic $1.35/verification** ($149/mo min); **Compliance $1.85** ($299/mo min) | Modest minimum |
| **Resemble AI** | Multimodal in a single call: synthetic voice (TTS), real-time webcam face-swap, AI-generated IDs | Usage-based | — |

**Cost-per-check math:** Renting liveness at ~$0.015 and a deepfake check via a free/cheap tier means your **cost per candidate check is cents.** If you sell a check for even $5–25, the gross margin is enormous. That's what makes per-check pricing work for a bootstrapper.

> ⚠️ **Resell vs. integrate:** Only **integrate** is confirmed. White-label/resell would need a separate partner agreement with the vendor. For the demo and early product, integrate under your own account — don't promise customers a white-labeled engine yet.

## 4. Pricing Model ✅ Per-check is proven

- **Per-check (usage-based) is the dominant, proven model** — Sumsub and AWS both price this way, and it maps perfectly to a recruiter's mental model ("X dollars per candidate").
- **SMB/self-serve entry is viable** (AWS has no real minimum; Sumsub minimums are modest).
- **Evolution:** start per-check → add per-seat or tiered subscription as you move into their workflow (matches the roadmap).

## 5. Regulation — The real landmine 🔴 Take seriously

| Law | What it means for you |
|---|---|
| **Illinois BIPA** | **$1,000 per negligent / $5,000 per intentional violation**, private right of action, no actual harm required. **Third-party verification vendors have been sued even without a direct relationship to the data subject** (*Mahmood v. Berbix*). For a bootstrapper handling biometric data, this is **existential** — one class action ends you. |
| **NYC Local Law 144** (2023) | AI hiring tools need an independent **disparate-impact bias audit** (race/sex/ethnicity) + applicant notice before use. |
| Others (open) | Texas CUBI, Washington, Colorado AI Act, EEOC guidance — full multi-state burden not mapped here. |

**Mitigations to design in from day one:**
- Explicit **consent flow** before any biometric capture.
- Consider **limiting or excluding Illinois** deployments early.
- Position as a **fraud/security signal**, not an "automated employment decision tool," and **keep a human in the loop** (you flag; the recruiter decides) — this both reduces bias-law exposure and is the honest, correct design given detectors aren't 100%.
- Don't store biometric data longer than needed; lean on the vendor's processing where possible.

## 6. Why Startups Here Fail (risks)

1. **Detection is a commodity** — no moat from the engine alone; incumbents + IDV giants already have it.
2. **Already contested** — GetReal is purpose-built for exactly this; Sumsub/Persona are adjacent and moving in.
3. **Biometric-privacy liability** — BIPA can be fatal to an undercapitalized founder.
4. **Accuracy / false positives** — flagging a real candidate as fake is reputationally and legally dangerous; this is why human-in-the-loop is mandatory.
5. **Buyer ambiguity** — unclear whether HR, security, or trust & safety holds the budget (an open question to resolve in interviews).

## Open Questions (resolve via interviews / next research)

1. **Who holds the budget** — HR vs. CISO vs. trust & safety? And what are real deal sizes / sales-cycle lengths for hiring-fraud detection specifically?
2. **Accuracy** of the rentable APIs on *real-time injected* deepfakes in live interviews — is reselling defensible vs. GetReal's purpose-built engine?
3. **Full multi-state compliance burden** beyond BIPA + NYC LL144.
4. **The moat** — confirmed direction is *workflow/ATS-native integration*, not detection tech. Validate buyers actually want that.
