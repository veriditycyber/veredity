// Outbound webhooks — push events to a customer's own systems. Each delivery is
// signed with the endpoint's secret (HMAC-SHA256 over the raw body) in the
// X-TrueHire-Signature header. Best-effort and fire-and-forget.
import crypto from "node:crypto";
import { prisma } from "./db";

export const WEBHOOK_EVENTS = ["candidate.scored", "candidate.high_risk", "verification.completed"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export function newSecret(): string {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}

async function deliver(hook: { id: string; url: string; secret: string }, event: string, payload: any) {
  const body = JSON.stringify({ event, created: Math.floor(Date.now() / 1000), data: payload });
  const sig = crypto.createHmac("sha256", hook.secret).update(body).digest("hex");
  try {
    const r = await fetch(hook.url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-truehire-signature": sig, "x-truehire-event": event },
      body,
      signal: AbortSignal.timeout(8000),
    });
    await prisma.webhook.update({ where: { id: hook.id }, data: { lastStatus: r.status, lastAt: new Date() } }).catch(() => {});
  } catch {
    await prisma.webhook.update({ where: { id: hook.id }, data: { lastStatus: 0, lastAt: new Date() } }).catch(() => {});
  }
}

// Dispatch an event to all of a user's active webhooks subscribed to it.
export async function dispatch(userId: string, event: WebhookEvent, payload: any): Promise<void> {
  try {
    const hooks = await prisma.webhook.findMany({ where: { userId, active: true } });
    const targets = hooks.filter((h) => h.events === "*" || h.events.split(",").map((s) => s.trim()).includes(event));
    // Fire concurrently; don't block the caller on delivery.
    await Promise.allSettled(targets.map((h) => deliver(h, event, payload)));
  } catch {}
}
