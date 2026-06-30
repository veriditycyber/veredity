import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelSubscription, razorpayConfigured } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!razorpayConfigured()) return NextResponse.json({ error: "not_enabled" }, { status: 503 });

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.razorpaySubscriptionId) return NextResponse.json({ ok: false, message: "No active subscription." }, { status: 404 });

  try {
    await cancelSubscription(sub.razorpaySubscriptionId, true);
    await prisma.subscription.update({ where: { userId: user.id }, data: { cancelAtPeriodEnd: true } });
    return NextResponse.json({ ok: true, message: "Your plan will stay active until the end of the current period, then revert to Free." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Could not cancel." }, { status: 502 });
  }
}
