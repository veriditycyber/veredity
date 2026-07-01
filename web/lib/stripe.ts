// Stripe subscriptions (international cards) alongside Razorpay (India). Server-only,
// raw REST — no SDK, consistent with the rest of the codebase. Degrades gracefully
// when STRIPE_SECRET_KEY is unset.
import crypto from "node:crypto";

const KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export function stripeConfigured(): boolean {
  return !!KEY;
}

// Stripe expects application/x-www-form-urlencoded with bracketed nested keys.
function encodeForm(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") parts.push(encodeForm(v, key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return parts.filter(Boolean).join("&");
}

async function stripe(path: string, body: Record<string, any>) {
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: encodeForm(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `Stripe error (${r.status})`);
  return data;
}

export async function createCheckoutSession(opts: {
  priceId: string; userId: string; email: string; plan: string; successUrl: string; cancelUrl: string;
}) {
  return stripe("/checkout/sessions", {
    mode: "subscription",
    "line_items": [{ price: opts.priceId, quantity: 1 }],
    client_reference_id: opts.userId,
    customer_email: opts.email,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { userId: opts.userId, plan: opts.plan },
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan } },
  }) as Promise<{ id: string; url: string }>;
}

export async function cancelStripeSubscription(subscriptionId: string) {
  // Cancel at period end (matches the Razorpay behaviour).
  return stripe(`/subscriptions/${subscriptionId}`, { cancel_at_period_end: "true" });
}

// Verify a Stripe webhook signature (Stripe-Signature: t=…,v1=…).
export function verifyStripeSignature(rawBody: string, sigHeader: string): boolean {
  if (!WEBHOOK_SECRET || !sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const t = parts.t; const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected); const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
