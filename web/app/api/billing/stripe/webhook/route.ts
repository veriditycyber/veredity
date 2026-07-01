import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyStripeSignature } from "@/lib/stripe";
import { planOf } from "@/lib/plans";

export const runtime = "nodejs";

// Stripe subscription webhook — authoritative for the Stripe billing path.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  if (!verifyStripeSignature(raw, sig)) return NextResponse.json({ error: "bad_signature" }, { status: 400 });

  let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  const obj = event?.data?.object || {};
  const type: string = event.type || "";

  const upsertActive = async (userId: string, plan: string, subId?: string, custId?: string, periodEnd?: number) => {
    await prisma.subscription.upsert({
      where: { userId },
      update: { provider: "stripe", plan, status: "active", stripeSubscriptionId: subId, stripeCustomerId: custId, cancelAtPeriodEnd: false, ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}) },
      create: { userId, provider: "stripe", plan, status: "active", stripeSubscriptionId: subId, stripeCustomerId: custId, ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}) },
    });
    await prisma.user.update({ where: { id: userId }, data: { plan } });
  };

  if (type === "checkout.session.completed") {
    const userId = obj.client_reference_id || obj.metadata?.userId;
    const plan = planOf(obj.metadata?.plan);
    if (userId) await upsertActive(userId, plan, obj.subscription, obj.customer);
    return NextResponse.json({ ok: true });
  }

  if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const sub = obj.id ? await prisma.subscription.findFirst({ where: { stripeSubscriptionId: obj.id } }) : null;
    if (sub) {
      const cancelled = type === "customer.subscription.deleted" || obj.status === "canceled";
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: {
          status: cancelled ? "cancelled" : (obj.status || sub.status),
          cancelAtPeriodEnd: !!obj.cancel_at_period_end,
          ...(obj.current_period_end ? { currentPeriodEnd: new Date(obj.current_period_end * 1000) } : {}),
        },
      });
      if (cancelled) await prisma.user.update({ where: { id: sub.userId }, data: { plan: "free" } });
    }
  }

  return NextResponse.json({ ok: true });
}
