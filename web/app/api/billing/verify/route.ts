import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyCheckoutSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

// Optimistic confirmation right after Razorpay Checkout succeeds in the browser.
// The webhook remains the source of truth, but this gives instant feedback.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json().catch(() => ({}));
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ ok: false, message: "Missing payment details." }, { status: 400 });
  }
  if (!verifyCheckoutSignature(razorpay_payment_id, razorpay_subscription_id, razorpay_signature)) {
    return NextResponse.json({ ok: false, message: "Payment signature mismatch." }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub || sub.razorpaySubscriptionId !== razorpay_subscription_id) {
    return NextResponse.json({ ok: false, message: "Subscription not found." }, { status: 404 });
  }
  await prisma.subscription.update({ where: { userId: user.id }, data: { status: "active" } });
  await prisma.user.update({ where: { id: user.id }, data: { plan: sub.plan } });
  return NextResponse.json({ ok: true, plan: sub.plan });
}
