// Razorpay subscriptions for Veridity. Server-only. Degrades gracefully when keys
// aren't set (the billing UI shows a "not enabled yet" state instead of breaking).
import crypto from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export function razorpayConfigured(): boolean {
  return !!(KEY_ID && KEY_SECRET);
}
export const RAZORPAY_KEY_ID = KEY_ID;

async function rzp(path: string, method: "GET" | "POST", body?: object) {
  const r = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.description || `Razorpay error (${r.status})`);
  return data;
}

export async function createSubscription(planId: string, userId: string, totalCount = 12) {
  return rzp("/subscriptions", "POST", {
    plan_id: planId,
    total_count: totalCount,
    quantity: 1,
    customer_notify: 1,
    notes: { userId },
  }) as Promise<{ id: string; short_url: string; status: string; customer_id?: string }>;
}

export async function cancelSubscription(subId: string, atCycleEnd = true) {
  return rzp(`/subscriptions/${subId}/cancel`, "POST", { cancel_at_cycle_end: atCycleEnd ? 1 : 0 });
}

// Verify the signature Razorpay Checkout returns to the browser on success.
export function verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${paymentId}|${subscriptionId}`).digest("hex");
  return safeEqual(expected, signature);
}

// Verify a webhook payload using the webhook secret.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a); const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
