# Demo Build Spec — The 1–2 Week "Wow" Demo

> The convincing demo you reveal at the end of interviews. Goal: look real, cost almost nothing, take ~1–2 weeks. NOT a production product. Grounded in `07-wedge-research.md` + `08-product-and-plan.md`.
> **Generated:** 2026-06-19

---

## What the demo must do (and nothing more)

Show a recruiter this story in 60 seconds:
> "Here's a candidate video. I run it through the tool. It comes back **🔴 likely deepfake** with reasons and a report I can save. Here's a real candidate — **🟢 verified**."

That's it. Resist building accounts, billing, dashboards, ATS integration — none of that is needed to test the *idea*.

## Scope — IN vs OUT

| ✅ IN (build this) | ❌ OUT (fake or skip) |
|---|---|
| One web page, clean and credible | User accounts / login |
| Upload a video/image **or** pick a canned sample | Billing / payments |
| A "verify" button → loading state | Real-time live-interview overlay (that's Stage 2) |
| **Green / Yellow / Red** result card | ATS integration |
| A short report: risk score, flagged signals, evidence thumbnail | A trained model (you rent detection) |
| A consent checkbox before "upload" | Multi-user / teams |
| Your logo + one-line positioning | Mobile app |

## The canned scenarios to show (prepare 3–4)

Pre-run these so the demo never fails live:
1. **🔴 Obvious deepfake** — a known face-swap clip → high risk, clear flags.
2. **🟢 Clean real candidate** — an ordinary webcam clip → verified, low risk.
3. **🟡 Borderline** — something ambiguous → "needs human review" (shows the honest, human-in-the-loop design — a selling point, not a weakness).
4. *(Optional)* **Voice-clone** example → flags synthetic audio (shows multi-modal ambition).

Keep the actual sample files local so a flaky API or network never breaks the demo. Live upload can be a *bonus* if the connection is good.

## Detection engine (rent, don't build)

| Use | API | Why |
|---|---|---|
| Image/video deepfake | **Reality Defender API — free tier (50 detections/mo)** | Free, ~2 lines of code; perfect for a demo. (Video may be pending — check; fall back to image frames.) |
| Liveness / face spoof | **AWS Rekognition Face Liveness (~$0.015/check)** | Cheap, robust, detects injection/3D-mask. |
| Voice clone (optional) | **Resemble AI / Reality Defender audio** | For the multi-modal scenario. |

> For the demo you can even **pre-compute** the API results for your canned files and store them — so the page is instant and never depends on a live call. Wire one real live call only if you want the "upload your own" bonus.

## The report format (this is what they remember)

A simple card:
```
  CANDIDATE CHECK — [name/sample]            🔴 HIGH RISK (score 87/100)

  ⚠️  Face-swap artifacts detected (eyes/jawline)
  ⚠️  Frame-to-frame inconsistency
  ✅  Audio: no synthetic voice detected
  ◻️  Liveness: not run (demo)

  Recommendation: Escalate — manual re-verification advised.
  [ Download PDF report ]     Checked 2026-06-19 · Human review required
```
The **PDF/audit-trail** angle matters: it's what compliance buyers latch onto and a key differentiator vs. a bare score.

## Tech (keep it boring and fast)

- **Stack:** whatever you ship fastest in — a single-page web app (e.g. Next.js / plain React + a tiny backend, or even a no-code + serverless function for the one API call). Don't over-engineer.
- **Hosting:** free tier (Vercel/Netlify/etc.).
- **Build time target:** 1–2 weeks part-time. If it's taking longer, you're over-building — cut scope.

## Demo guardrails

- **Consent checkbox** present before upload — start the BIPA-safe habit now, and it signals you take compliance seriously (a selling point to enterprise-minded buyers).
- **Show the yellow/human-in-the-loop case** on purpose — honesty about "detection isn't 100%, you decide" builds trust and is legally smart.
- **Don't claim accuracy numbers** you can't back. Say "risk signal," not "definitive proof."
- **Label it a demo.** You're testing desire, not shipping. Over-promising creates support/liability you can't carry yet.

## Definition of done

You can sit across from a recruiter, run 3 scenarios in under 2 minutes, hand them a report PDF, and they say **"when can I try this on my candidates?"** That question = success. Then you make the paid-pilot ask.
