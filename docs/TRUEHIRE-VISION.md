# TrueHire — the Trust Layer for Online Hiring

> Vision: **every company that hires online runs the candidate through TrueHire first** —
> the way every online payment runs through Stripe, and every login through Okta.

This document is the strategy: why now, who else is here, and the out-of-the-box
bets that take TrueHire from a tool to an industry standard. It's grounded in 2026
market research (sources at the bottom).

---

## 1. Why now — the market is exploding, not emerging

- **Fake/AI candidates are the #1 hiring challenge of 2026**, ahead of the talent
  shortage that has topped that list for years (GoodTime 2026 Hiring Insights).
- **Gartner: 1 in 4 candidate profiles will be fake by 2028.** 6% of job seekers
  already admit to interview fraud (proxy or impersonation).
- **By the end of 2026, ~30% of enterprises say their existing identity tools can no
  longer reliably tell a real face from a deepfake.** The old stack is breaking in
  real time.
- **23% of companies have already found identity fraud among new hires** (Checkr).
- **The North-Korean fake-IT-worker scheme** funnels *billions* to a sanctioned
  state and has triggered DOJ/FBI/Treasury action — hiring one is now a *legal and
  breach* risk, not just a bad hire.

The pain is quantified, urgent, board-level, and getting worse every quarter. That's
the rare macro tailwind a bootstrapper wants.

## 2. Who else is here — and why TrueHire can still win

Well-funded identity players are moving in: **Persona** (just launched candidate
verification), **Proof**, **Sardine**, plus incumbents like **Sterling** and
**HackerRank** (proxy detection). The space is validated — and crowding.

TrueHire's edges against them:

- **Self-serve & fast, not enterprise-sales-gated.** Persona/Proof sell contracts to
  big security teams. Nobody serves the recruiter, the 20-person startup, or the
  staffing agency who wants to verify *one candidate in two minutes, today.* That's
  a wide-open wedge — and it's how you get to "every company."
- **Fused, not point-solution.** Competitors do IDV *or* proxy detection *or*
  background checks. TrueHire already fuses **deepfake detection + a metadata Trust
  Score + interview decision-support** into one verdict. The product is "is this
  candidate real *and* good?" — nobody else owns that whole question.
- **India-first beachhead.** Proxy interviews are endemic in Indian IT services.
  `veridity.in` + Razorpay already position TrueHire to win India's staffing/IT
  market — a huge, underserved home turf — before going global.

## 3. The three horizons

**Horizon 1 — The Tool (now).** Verify any candidate: deepfake check, Trust Score,
interview integrity, audit report. Land recruiters and SMBs self-serve.

**Horizon 2 — The Platform.** Embed everywhere hiring happens (ATS, video calls,
job boards) via API + integrations, so verification is one click inside the tools
teams already live in. Recurring, seat-based, sticky.

**Horizon 3 — The Standard.** A **portable "TrueHire Verified" credential** every
candidate carries and every company trusts — plus a **fraud-intelligence network**
that gets smarter with every check. This is the moat and the "every company" outcome.

---

## 4. The out-of-the-box bets

### 🅐 TrueHire Verified — a portable trust passport for candidates *(the moonshot)*
A candidate verifies **once** (ID + liveness + deepfake + trust signals) and earns a
cryptographically-signed, reusable **"TrueHire Verified" badge** they attach to any
application or LinkedIn. Companies trust the badge instead of re-verifying.
- **Why it wins:** two-sided network effect. Candidates want it (verify once, skip
  the friction everywhere). Companies want verified candidates. The more who carry
  it, the more companies demand it — that flywheel *is* "used by every company."
- This is the LinkedIn-verification × identity-passport play. First mover with volume
  owns the standard.

### 🅑 Live Interview Shield — real-time proxy & deepfake detection
A companion (bot that joins the Zoom/Meet/Teams call, or a browser overlay) that
flags **in real time**: face-swap, lip-sync drift, a *second voice* in the room
("sounds like a call center" — an actual FBI red flag), and VPN/geo mismatch.
- **Why it wins:** the FBI literally advises "use live video interviews" to catch
  fraud — TrueHire *automates that advice.* This is the flagship demo that sells the
  vision, and it's what the deepfake panic is actually about (live calls, not clips).

### 🅒 Fraud Intelligence Network — the data moat
Every check across all customers feeds a privacy-safe **shared fraud graph**:
repeat fake identities, laptop-farm IP ranges, disposable-domain bursts, known proxy
rings, reused deepfake faces.
- **Why it wins:** "the more companies use TrueHire, the smarter it gets." This is the
  one asset funded competitors *cannot buy* — it compounds with volume. Get volume
  early (via the self-serve wedge) and this becomes uncopyable.

### 🅓 Trust API + webhooks — "Stripe for candidate trust"
A clean API every ATS, job board, and internal tool calls to score a candidate.
- **Why it wins:** infrastructure = ubiquity. This is the literal mechanism by which
  "every company that hires online" ends up running through TrueHire — often without
  even knowing the brand.

### 🅔 Continuous / post-hire re-verification
Fraud doesn't stop at the offer — laptop farms and account hand-offs happen *after*
hire. Periodic "still the same person on payroll?" checks close the loop competitors
leave open.
- **Why it wins:** recurring revenue, and it directly counters the NK laptop-farm
  playbook. Nobody owns post-hire identity continuity yet.

### 🅕 Compliance & sanctions packet
Auto-generate an **audit-ready verification report** and screen candidates against
**sanctions/OFAC lists** (directly addresses NK-worker sanctions liability) and
right-to-work / I-9 needs.
- **Why it wins:** turns TrueHire from "nice to have" into "legally necessary" — the
  strongest possible buying trigger.

### 🅖 Candidate-friendly, consent-first verification
Only **26% of applicants trust that AI will evaluate them fairly** (Gartner). Make
TrueHire the *respectful, transparent* verification both sides actually like — a
differentiator in a market full of creepy surveillance tools, and a wedge into
candidate goodwill that feeds Bet 🅐.

---

## 5. Mapping bets → horizons

| Horizon | Bets | Outcome |
|---------|------|---------|
| **1 — Tool** | ✅ Trust Score (done) · 🅕 compliance report · 🅖 consent-first UX | Land self-serve users |
| **2 — Platform** | 🅑 Live Interview Shield · 🅓 Trust API · ATS/video integrations | Get embedded & sticky |
| **3 — Standard** | 🅐 TrueHire Verified passport · 🅒 Fraud network · 🅔 continuous re-verify | Own the category |

## 6. What I'd build next (concrete)

1. **Audit-ready PDF report** (🅕) — small, immediately raises perceived value and
   deal size. Ships this week.
2. **Real ID + liveness upgrade** to the self-verification link — the foundation
   both the passport (🅐) and enterprise trust need.
3. **Trust API + webhook** (🅓) — turn the engine you now have into infrastructure.
4. **Live Interview Shield MVP** (🅑) — the flagship the whole vision is sold on.
   Start with *post-call* analysis (upload/auto-transcribe → deepfake + proxy), then
   go real-time.
5. Begin logging every signal toward the **Fraud Intelligence Network** (🅒) from day
   one — the data compounds, so start collecting now even before you productize it.

## 7. Business model notes

- **Self-serve tiers** (already built, Razorpay) for SMB/recruiter land.
- **Per-verification** pricing for the passport & API (usage scales with value).
- **Seat + volume** for teams/agencies (India IT services = ideal early ICP).
- **Compliance/enterprise** tier for the audit packet + sanctions + SSO.

---

### Sources
- [Gartner — 1 in 4 candidate profiles fake by 2028 (HR Dive)](https://www.hrdive.com/news/fake-job-candidates-ai/757126/)
- [Fake candidates top 2026 hiring threats; 99.8% of recruiters adopting AI (Recruiting News Network)](https://www.recruitingnewsnetwork.com/posts/fake-candidates-top-2026-hiring-threats-as-99-8-of-recruiters-race-to-adopt-ai)
- [Rise of AI Interview Fraud in 2026 — deepfakes & proxy hiring (Sherlock)](https://www.withsherlock.ai/blog/rise-of-ai-interview-fraud)
- [Deepfake job hires: when your next breach starts with an interview (The Hacker News)](https://thehackernews.com/expert-insights/2026/01/deepfake-job-hires-when-your-next.html)
- [Persona launches candidate verification (PR Newswire)](https://www.prnewswire.com/news-releases/persona-launches-candidate-verification-to-stop-hiring-fraud-before-day-one-302711200.html)
- [Top 10 candidate fraud & identity verification tools for 2026 (Proof)](https://www.proof.com/blog/top-10-candidate-fraud-and-identity-verification-tools-to-consider-in-2026)
- [How to spot fraudulent North Korean IT workers (TechTarget)](https://www.techtarget.com/searchsecurity/feature/How-to-spot-and-expose-fraudulent-North-Korean-IT-workers)
- [North Korean remote IT worker fraud — sanctions & employment risk (Skadden)](https://www.skadden.com/insights/publications/2026/06/north-korean-remote-it)
- [Gartner — just 26% of applicants trust AI to evaluate them fairly](https://www.gartner.com/en/newsroom/press-releases/2025-07-31-gartner-survey-shows-just-26-percent-of-job-applicants-trust-ai-will-fairly-evaluate-them)
