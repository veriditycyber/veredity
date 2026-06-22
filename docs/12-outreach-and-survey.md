# Outreach Messages + Market-Sentiment Survey

> Goal: message **50 people**, route the interested ones to a short survey, and measure **whether they'd pay**. Not selling — learning. This is the signal that tells us whether to build.
> **Generated:** 2026-06-19

---

## ⚠️ Read first — which demo to link in the survey

**Host the STATIC demo (sample candidates only) for the survey — NOT the backend.**
- The backend (`server/`) holds your Reality Defender API key and has only **50 free scans/month**. If random survey-takers upload files, they'll burn your quota in minutes and you risk exposing the key.
- The **static `demo/index.html`** (scripted samples) is perfect for a public link: it always works, costs nothing, exposes no key. Survey-takers click the sample candidates and see the green/yellow/red flow — exactly what you want them to react to.

**How to host it free (2 min):** go to [app.netlify.com/drop](https://app.netlify.com/drop) → drag the `demo` folder in → you get a public URL like `your-demo.netlify.app`. Put *that* link in the survey. (Or Vercel / GitHub Pages.)

---

## The 4 messages

Keep them short, human, and **question-ended**. No links in the first message. Personalize the bracketed bits.

### 1. Opening — warm connection (default)
> Hi [First name] — quick one, and not a pitch. I'm researching how remote-hiring teams deal with fake/deepfake candidates (impersonation, AI-assisted interviews, the North-Korea IT-worker thing).
>
> You've got real hiring experience, so your honest view would genuinely help: have you ever run into — or worried about — a candidate not being who they claimed?
>
> No selling, just learning. 🙏

### 2. Opening — security / IT angle
> Hi [First name] — not selling anything, just researching. Deepfake candidates and the North-Korean remote-worker scheme have now hit 300+ US companies, so I'm trying to understand how security/IT teams think about identity fraud in hiring.
>
> Has this landed on your radar at [Company]? Would love your blunt take.

### 3. Follow-up — if no reply after ~4 days (send once)
> Hey [First name], no worries if you're slammed — just chasing this one thread. Even a one-line gut reaction on whether fake/deepfake candidates are a real concern for your team would help a lot. Thanks either way!

### 4. Bridge to the survey — when they reply / show interest
> Amazing, thank you. I turned it into a 3-minute survey so it's easy on you — and there's a 60-second demo inside to react to. Pure research, no one will sell you anything: [SURVEY LINK]
>
> Genuinely grateful — responses like yours are what tell me whether this is worth building.

---

## Message guidelines (the rules)

- **Lead with "not a pitch."** It disarms and gets replies.
- **Ask a question, end on it.** Messages that ask outperform messages that tell.
- **No link in message #1.** Links scream "marketing." Earn the reply first, then send the survey.
- **Personalize one real detail** (their role, company, or a recent post). Generic = ignored.
- **One follow-up max.** More than that annoys the exact people you want as customers.
- **Don't argue or over-explain** if they're skeptical — skepticism *is* data. Thank them and move on.
- **Pace it:** ~10–15 messages/day, spread out. Blasting 50 at once looks (and to LinkedIn, reads) like spam.

---

# The Survey

**Tool:** Google Forms, [Tally](https://tally.so), or Typeform (all free). Keep it ~3 minutes.

**Title:** *Deepfake fraud in hiring — 3-minute research survey*

**Intro text:**
> I'm researching how hiring teams handle fake/deepfake candidates. This is **research, not a sales pitch** — no one will contact you to sell anything. It takes ~3 minutes and includes a 60-second demo to react to. Thank you — this genuinely shapes whether I build it.

### Section 1 — You
1. **Your role** — ◻ Recruiter / Talent Acquisition ◻ HR / People Ops ◻ Security / IT ◻ Founder / Exec ◻ Other
2. **Company size** — ◻ 1–50 ◻ 51–200 ◻ 201–1,000 ◻ 1,000+
3. **How much of your interviewing is remote/video?** — ◻ Most ◻ Some ◻ Very little

### Section 2 — The problem (past behaviour = real signal)
4. **Have you ever suspected or caught a candidate who wasn't who they claimed** (deepfake, impersonation, AI-assisted)? — ◻ Yes, caught one ◻ Yes, suspected ◻ No ◻ Not sure
5. *(If yes)* **What happened, and what did it cost you?** — _open text_
6. **How serious is candidate identity fraud vs your other hiring problems today?** — 1 (not on my radar) → 5 (keeps me up at night)
7. **Do you currently pay for any identity or background verification?** Which, and roughly how much? — _open text_

### Section 3 — React to the demo
> Please open this 60-second demo, click through the sample candidates, then answer: **[STATIC DEMO LINK]**

8. **First reaction to the demo?** — 1 (not useful) → 5 (I want this) + _optional comment_
9. **Would something like this fit into your hiring process?** — ◻ Yes ◻ Maybe ◻ No — *why?* _open text_
10. **What's missing, or what would stop you trusting / using it?** — _open text_  *(this surfaces objections: false positives, bias/legal, candidate friction)*

### Section 4 — Willingness to pay (the core question)
11. **If it reliably flagged fake candidates, would your team pay for it?** — ◻ Yes ◻ Maybe ◻ No ◻ Not my budget to decide
12. **Whose budget would this come from?** — ◻ Mine ◻ HR / Talent ◻ Security / IT ◻ Don't know
13. **What would you expect to pay per candidate check?** — ◻ Wouldn't pay ◻ <$2 ◻ $2–5 ◻ $5–15 ◻ $15–50 ◻ $50+
14. **Or, as a monthly subscription per recruiter seat?** — ◻ Wouldn't ◻ <$25 ◻ $25–75 ◻ $75–200 ◻ $200+

### Section 5 — Commitment (the strongest signal)
15. **We're opening a few paid pilots soon. Want in, or want early access?** — ◻ Yes, I'd pilot it (leave email) ◻ Keep me posted ◻ No
16. **Email** *(only if you want updates / a pilot)* — _short answer_
17. **Anyone else dealing with this we should talk to?** — _open text_

---

## How to read the results (your scorecard)

The survey's job is to produce **3 numbers**:

| Metric | What it tells you | Rough "go" bar |
|---|---|---|
| **% who caught/suspected a fake candidate** (Q4) | Is the pain real for your audience? | ≥ 40% |
| **% who'd pay** (Q11 = Yes) | Stated willingness — directional | ≥ 30% |
| **# who left an email for a paid pilot** (Q15/16) | **The real signal — actual commitment** | **≥ 5–8 from 50** |

> ⚠️ **Stated willingness (Q11) is weak; the email-for-pilot (Q15) is strong.** People say "yes I'd pay" politely all the time. Someone handing over their email to pilot a *paid* product is putting skin in the game. Weight that 10x. If even 5–8 of your 50 do that, you have real demand — build. If lots say "cool!" but nobody leaves an email, the enthusiasm is hollow.

## Funnel math (set expectations)
- Message **50** → expect ~**30–40%** reply → ~**15–20 conversations**.
- Of those, ~**half** complete the survey → ~**8–12 responses**.
- Want more survey responses? Message more people (aim 80–100), or post the problem publicly and drive to the survey.
- **Target: ~25–40 completed surveys + 5–8 pilot emails** = enough signal to decide.
