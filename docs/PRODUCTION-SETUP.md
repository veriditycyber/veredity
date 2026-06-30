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
