# Veridity — Production Setup Guide

Everything you need to turn Veridity into a real production app: subscriptions,
email verification, Google & Apple sign-in, and multi-model AI.

**How this is built:** every service is *optional and independent*. If a key is
missing, that one feature politely turns itself off (the UI shows a "configure X"
message) — the rest of the app keeps working. So you can switch things on one at a
time, in any order.

All keys go in **`web/.env.local`** for local dev, and into your **Vercel project
env vars** for production. Placeholders are already in both `.env.local` and
`.env.example`.

---

## 0. Database — already applied ✅

The schema changes (new tables for subscriptions, email tokens, OAuth ids,
payments, plus new User columns) have **already been pushed to your Neon database**
— it only *added* new, empty columns/tables, nothing was deleted.

If you ever change the schema again, re-apply with:

```bash
cd web
npx prisma db push
```

---

## 1. APP_URL (do this first — emails & logins depend on it)

This is the public base URL Veridity uses to build email links and OAuth callbacks.

| Where | Value |
|-------|-------|
| Local dev | `http://localhost:3000` |
| Production | `https://veridity.in` (your real domain) |

```
APP_URL=https://veridity.in
```

---

## 2. AI providers (the model picker)

The "choose your model" dropdown shows whichever providers have a key set. Add one,
two, or all three. **At least one** is needed for Interview AI and the Forge coach.

| Provider | Get a key at | Env var |
|----------|-------------|---------|
| Anthropic (Claude) | https://console.anthropic.com → API Keys | `ANTHROPIC_API_KEY` |
| OpenAI (GPT) | https://platform.openai.com/api-keys | `OPENAI_API_KEY` |
| Google (Gemini) | https://aistudio.google.com/app/apikey | `GEMINI_API_KEY` |

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

Each provider bills you directly for usage. Start with **Anthropic only** if you
want the simplest setup — you can add the others anytime and they appear in the
picker automatically.

**Test it:** open *Interview AI* or *Forge → Start a session*. The model dropdown
(top right of the box) should list your configured models. Pick one and run it.

---

## 3. Email — verification & password reset (Resend)

Used to send the "confirm your email" and "reset your password" messages.

1. Create a free account at **https://resend.com**.
2. **Add your domain**: Resend → *Domains* → *Add Domain* → enter `veridity.in`.
   Resend shows you DNS records (SPF, DKIM). Add them at your domain registrar
   (where you bought veridity.in). Wait for them to verify (usually minutes).
3. Resend → *API Keys* → *Create API Key* → copy it.
4. Set:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM="Veridity <noreply@veridity.in>"
   ```
   > Before your domain is verified you can test with
   > `EMAIL_FROM="Veridity <onboarding@resend.dev>"` (Resend's sandbox sender).

**Test it:** sign up with a real email → you should get a verification mail. Or use
the yellow "Verify your email" banner inside the app → *Resend email*.

---

## 4. Google Sign-In

1. Go to **https://console.cloud.google.com** → create a project (e.g. "Veridity").
2. *APIs & Services → OAuth consent screen*: choose **External**, fill app name
   ("Veridity"), support email, and your domain. Add scopes `email`, `profile`,
   `openid`. Save. (You can keep it in "Testing" mode with your own email added as
   a test user until you're ready to publish.)
3. *APIs & Services → Credentials → Create Credentials → OAuth client ID*:
   - Application type: **Web application**
   - **Authorized redirect URIs** — add BOTH:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://veridity.in/api/auth/google/callback`
4. Copy the **Client ID** and **Client secret**:
   ```
   GOOGLE_CLIENT_ID=....apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   ```

**Test it:** the login/signup pages now show a **Continue with Google** button.

---

## 5. Apple Sign-In

Apple is the fiddliest (requires a paid Apple Developer account, $99/yr). Skip it
if you don't need it yet — the button only appears once it's configured.

1. **https://developer.apple.com/account** → *Certificates, Identifiers & Profiles*.
2. **Identifiers → App ID** (or use an existing one). Note your **Team ID**
   (top-right of the account page, 10 chars) → `APPLE_TEAM_ID`.
3. **Identifiers → + → Services IDs**: create one, e.g. `in.veridity.signin`.
   This string is your `APPLE_CLIENT_ID`. Enable **Sign In with Apple** on it and
   click *Configure*:
   - **Domains**: `veridity.in`
   - **Return URLs**: `https://veridity.in/api/auth/apple/callback`
     (Apple does **not** allow `localhost` — test Apple in production only.)
4. **Keys → + → Sign in with Apple**: create a key, download the **`.p8`** file
   (you can only download it once). Note its **Key ID** → `APPLE_KEY_ID`.
5. Set:
   ```
   APPLE_CLIENT_ID=in.veridity.signin
   APPLE_TEAM_ID=ABCDE12345
   APPLE_KEY_ID=ABCDE12345
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
   ```
   > For `APPLE_PRIVATE_KEY`, paste the entire contents of the `.p8` file. In a
   > single-line `.env`, replace real line breaks with `\n` (the code converts
   > them back). In Vercel you can paste it with real newlines.

**Test it:** the **Continue with Apple** button appears on login/signup (production).

---

## 6. Razorpay subscriptions

This powers the Pro / Business upgrades on the **Billing** page.

### 6a. Account & API keys
1. Sign up at **https://razorpay.com** and complete KYC (business details, bank
   account). You can start in **Test Mode** immediately without full KYC.
2. Dashboard → *Settings → API Keys → Generate Key*. Copy both:
   ```
   RAZORPAY_KEY_ID=rzp_test_...      (or rzp_live_... when live)
   RAZORPAY_KEY_SECRET=...
   ```

### 6b. Create the subscription Plans
1. Dashboard → *Subscriptions → Plans → Create Plan*.
2. Create **two** monthly plans matching the app's pricing:
   - **Pro** — ₹3,999 / month
   - **Business** — ₹15,999 / month
   (Change the numbers if you like — just keep them in sync with
   `web/lib/plans.ts`.)
3. Copy each plan's ID (looks like `plan_Abc123...`):
   ```
   RAZORPAY_PLAN_PRO=plan_...
   RAZORPAY_PLAN_BUSINESS=plan_...
   ```

### 6c. Webhook (keeps plan status in sync)
1. Dashboard → *Settings → Webhooks → Create Webhook*.
2. **URL**: `https://veridity.in/api/billing/webhook`
3. **Secret**: make up a strong random string, put the SAME value here and in env:
   ```
   RAZORPAY_WEBHOOK_SECRET=your-strong-random-string
   ```
4. **Active events** — tick these:
   `subscription.activated`, `subscription.charged`, `subscription.pending`,
   `subscription.halted`, `subscription.cancelled`, `subscription.completed`.
5. Save.

**Test it:** Billing page → *Upgrade to Pro*. In Test Mode use Razorpay's
[test card](https://razorpay.com/docs/payments/payments/test-card-details/)
`4111 1111 1111 1111`, any future expiry, any CVV. After paying, your plan flips to
Pro (instantly via the success handler, and confirmed by the webhook).

---

## 6a. Stripe — international card payments (alongside Razorpay)

The Billing page has a region toggle: **India (Razorpay, INR)** or **International
(Stripe, USD)**. Stripe is optional — without it, the International option shows a
"not enabled yet" message and Razorpay keeps working.

1. Create/sign in at **https://dashboard.stripe.com**.
2. **Products** → create two recurring products with monthly prices:
   - **Pro** — $49 / month  → copy the **Price ID** (`price_…`)
   - **Business** — $199 / month → copy its **Price ID**
   (Adjust the USD numbers in `web/lib/plans.ts` → `USD_PRICE` if you change them.)
3. **Developers → API keys** → copy the **Secret key**.
4. **Developers → Webhooks → Add endpoint**:
   - URL: `https://veridity.in/api/billing/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_…`).
5. Set:
   ```
   STRIPE_SECRET_KEY=sk_live_...        (or sk_test_… while testing)
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_BUSINESS=price_...
   ```

**Test it:** Billing → toggle **International** → Upgrade. In test mode use card
`4242 4242 4242 4242`, any future expiry/CVC. Plan flips to the chosen tier via the
webhook.

---

## 6b. Interview Bot — join Zoom / Meet / Teams (Recall.ai)

The Interview Bot sends a notetaker into your video interviews, transcribes them
live, takes notes, checks integrity, and produces a scored report. Without a key it
still works in **manual mode** (paste a transcript → get notes + integrity + report).

1. Sign up at **https://www.recall.ai** and note your **workspace region** (e.g.
   `us-west-2`, `us-east-1`, `eu-central-1`).
2. Dashboard → **API Keys** → create one:
   ```
   RECALL_API_KEY=...
   RECALL_API_BASE=https://us-west-2.recall.ai/api/v1   # match your region
   ```
3. **Webhook** (for live status + transcript): Recall dashboard → *Webhooks* → add
   endpoint `https://veridity.in/api/bot/webhook`. Pick a secret and set it both on
   the webhook and in env:
   ```
   RECALL_WEBHOOK_SECRET=your-random-string
   ```
   Subscribe to bot **status change** and **transcript** events.

> Recall bills per bot-hour. The bot appears as a participant named "TrueHire
> Notetaker" — most teams announce it for consent, which TrueHire's consent-first
> stance recommends.

**Test it:** *Interview Bot → Paste a transcript* works with zero setup (just needs
an AI key). With Recall configured, paste a real Zoom/Meet link and the bot joins.

---

## 6d. Sanctions & watchlist screening (OpenSanctions) — optional

Adds a **sanctions / watchlist** signal to every Trust Score: screens the candidate
name against OFAC SDN, EU, UN, UK and PEP lists. Directly addresses the sanctions
liability of the North-Korean-worker problem. Advisory only — a hit flags "manual
review", never an automated rejection.

1. Get a key at **https://www.opensanctions.org** (they offer hosted API plans and
   a self-host option).
2. Set:
   ```
   OPENSANCTIONS_API_KEY=...
   OPENSANCTIONS_API_BASE=https://api.opensanctions.org
   ```

Without a key, the signal is simply omitted — everything else in the Trust Score
still works.

---

## 6e. ID + liveness verification (face match) — optional

The self-verification link has two modes: **Deepfake check** (selfie only, works with
just `RD_API_KEY`) and **ID + liveness** (live selfie with a liveness challenge + a
government ID photo). The liveness + deepfake parts work out of the box; the
**face-match** between selfie and ID is provider-gated.

Point it at any face-comparison service (AWS Rekognition `CompareFaces`, Azure Face,
Face++/Luxand, or a tiny proxy you host). It must accept
`POST { image1, image2 }` (base64) and return a similarity:
```
FACEMATCH_API_URL=https://your-endpoint/compare
FACEMATCH_API_KEY=...            # optional; sent as Bearer if set
```
Without it, ID links still capture the ID + run liveness + deepfake — only the
numeric face-match score is omitted.

---

## 6c. Trust API (developers) — nothing to configure

The public **Trust API** (`POST /api/v1/trust`) works out of the box — no external
service. Users create keys under **Developers**, and calls score candidates and land
in their dashboard. Only requirement: an AI provider key if you want the résumé
signal in API responses (§2). Great for embedding TrueHire into an ATS or job board.

---

## 7. Deploying the env vars to Vercel

For each variable above that you filled in locally:

1. Vercel → your project → *Settings → Environment Variables*.
2. Add the **Name** and **Value**, scope it to **Production** (and Preview if you
   want). Paste values **without** surrounding quotes.
3. Set `APP_URL=https://veridity.in` in Production.
4. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the new vars take effect.

> Reminder from before: make sure `DATABASE_URL` is set for the **Production**
> environment with no surrounding quotes — that was the cause of the earlier 500s.

---

## 8. Final checklist

- [ ] `npx prisma db push` ran successfully (§0)
- [ ] `APP_URL` set (local + Vercel) (§1)
- [ ] At least one AI provider key set; model picker shows it (§2)
- [ ] Resend domain verified; verification email arrives on signup (§3)
- [ ] Google button works end-to-end (§4)
- [ ] Apple button works in production (§5, optional)
- [ ] Razorpay test payment upgrades the plan; webhook configured (§6)
- [ ] Interview Bot: manual mode works; Recall configured for live join (§6b)
- [ ] All vars copied to Vercel + redeployed (§7)

---

## What changed in the code (for reference)

| Area | Files |
|------|-------|
| DB schema | `web/prisma/schema.prisma` — User fields + `VerificationToken`, `Subscription`, `Payment` |
| Multi-model AI | `web/lib/models.ts`, `web/lib/ai.ts`, `web/components/ModelPicker.tsx`, `web/app/api/models` |
| Email + reset | `web/lib/email.ts`, `web/lib/tokens.ts`, `web/app/api/auth/{verify,resend-verification,forgot,reset}`, `web/app/{verify-email,forgot-password,reset-password}` |
| Google/Apple | `web/lib/oauth.ts`, `web/app/api/auth/{google,apple}` + callbacks, `web/components/SocialAuth.tsx` |
| Razorpay | `web/lib/razorpay.ts`, `web/app/api/billing/{subscribe,verify,webhook,cancel}`, `web/components/BillingButton.tsx` |
| Account | `web/app/api/account/{password,preferences,delete}`, settings page |
| Trust Score | `web/lib/trust.ts`, `web/app/api/trust`, `web/app/(app)/trust`, `web/components/TrustFlow.tsx` |
| Interview Bot | `web/lib/recall.ts`, `web/lib/interviewBot.ts`, `web/app/api/bot/*`, `web/app/(app)/bot`, `web/components/{BotStart,BotConsole}.tsx` |
