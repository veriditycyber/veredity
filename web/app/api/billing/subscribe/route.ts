import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { planOf, razorpayPlanId, type Plan } from "@/lib/plans";
import { razorpayConfigured, createSubscription, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "not_enabled", message: "Payments aren't enabled yet. Connect Razorpay to turn on self-serve upgrades." }, { status: 503 });
  }

  const { plan } = await req.json().catch(() => ({}));
  const p = planOf(plan) as Plan;
  if (p === "free") return NextResponse.json({ error: "bad_plan", message: "Choose a paid plan." }, { status: 400 });

  const planId = razorpayPlanId(p);
  if (!planId) return NextResponse.json({ error: "no_plan_id", message: `No Razorpay plan configured for ${p}. Set RAZORPAY_PLAN_${p.toUpperCase()}.` }, { status: 503 });

  try {
    const sub = await createSubscription(planId, user.id);
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan: p, status: sub.status || "created", razorpaySubscriptionId: sub.id, shortUrl: sub.short_url, cancelAtPeriodEnd: false },
      create: { userId: user.id, plan: p, status: sub.status || "created", razorpaySubscriptionId: sub.id, shortUrl: sub.short_url },
    });
    return NextResponse.json({ keyId: RAZORPAY_KEY_ID, subscriptionId: sub.id, shortUrl: sub.short_url, plan: p, name: user.name || user.email, email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: "rzp_failed", message: e?.message || "Could not start checkout." }, { status: 502 });
  }
}
