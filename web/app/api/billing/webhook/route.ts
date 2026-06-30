import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

// Razorpay subscription webhook — the authoritative source for plan state.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const event: string = body.event || "";
  const subEntity = body.payload?.subscription?.entity;
  const payEntity = body.payload?.payment?.entity;

  // Resolve our user via the stored subscription id (or the notes.userId we set).
  const rzpSubId = subEntity?.id || payEntity?.subscription_id;
  let sub = rzpSubId ? await prisma.subscription.findUnique({ where: { razorpaySubscriptionId: rzpSubId } }) : null;
  if (!sub && subEntity?.notes?.userId) {
    sub = await prisma.subscription.findUnique({ where: { userId: subEntity.notes.userId } });
  }

  const setStatus = async (status: string, plan?: string) => {
    if (!sub) return;
    const periodEnd = subEntity?.current_end ? new Date(subEntity.current_end * 1000) : undefined;
    await prisma.subscription.update({ where: { userId: sub.userId }, data: { status, ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}) } });
    if (plan !== undefined) await prisma.user.update({ where: { id: sub.userId }, data: { plan } });
  };

  switch (event) {
    case "subscription.activated":
    case "subscription.authenticated":
    case "subscription.resumed":
      await setStatus("active", sub?.plan);
      break;
    case "subscription.charged":
      await setStatus("active", sub?.plan);
      if (sub && payEntity) {
        await prisma.payment.create({
          data: {
            userId: sub.userId,
            razorpayPaymentId: payEntity.id || null,
            amount: payEntity.amount || 0,
            currency: payEntity.currency || "INR",
            status: payEntity.status || "captured",
            description: `${sub.plan} subscription charge`,
          },
        }).catch(() => {});
      }
      break;
    case "subscription.pending":
      await setStatus("pending");
      break;
    case "subscription.halted":
      await setStatus("halted");
      break;
    case "subscription.cancelled":
      await setStatus("cancelled", "free");
      break;
    case "subscription.completed":
      await setStatus("completed", "free");
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
