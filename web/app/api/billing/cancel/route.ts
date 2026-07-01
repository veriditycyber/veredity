import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelSubscription } from "@/lib/razorpay";
import { cancelStripeSubscription } from "@/lib/stripe";
import { isAdmin } from "@/lib/perms";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden", message: "Only workspace admins manage billing." }, { status: 403 });

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub) return NextResponse.json({ ok: false, message: "No active subscription." }, { status: 404 });

  try {
    if (sub.provider === "stripe" && sub.stripeSubscriptionId) {
      await cancelStripeSubscription(sub.stripeSubscriptionId);
    } else if (sub.razorpaySubscriptionId) {
      await cancelSubscription(sub.razorpaySubscriptionId, true);
    } else {
      return NextResponse.json({ ok: false, message: "No cancellable subscription found." }, { status: 404 });
    }
    await prisma.subscription.update({ where: { userId: user.id }, data: { cancelAtPeriodEnd: true } });
    return NextResponse.json({ ok: true, message: "Your plan will stay active until the end of the current period, then revert to Free." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Could not cancel." }, { status: 502 });
  }
}
