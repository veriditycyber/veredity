import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { planOf, stripePriceId, type Plan } from "@/lib/plans";
import { stripeConfigured, createCheckoutSession } from "@/lib/stripe";
import { appUrl } from "@/lib/email";
import { isAdmin } from "@/lib/perms";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden", message: "Only workspace admins manage billing." }, { status: 403 });
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "not_enabled", message: "International card payments aren't enabled yet. Connect Stripe to turn them on." }, { status: 503 });
  }

  const { plan } = await req.json().catch(() => ({}));
  const p = planOf(plan) as Plan;
  if (p === "free") return NextResponse.json({ error: "bad_plan", message: "Choose a paid plan." }, { status: 400 });

  const priceId = stripePriceId(p);
  if (!priceId) return NextResponse.json({ error: "no_price", message: `No Stripe price configured for ${p}. Set STRIPE_PRICE_${p.toUpperCase()}.` }, { status: 503 });

  try {
    const base = appUrl();
    const session = await createCheckoutSession({
      priceId, userId: user.id, email: user.email, plan: p,
      successUrl: `${base}/billing?stripe=success`,
      cancelUrl: `${base}/billing?stripe=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: "stripe_failed", message: e?.message || "Could not start checkout." }, { status: 502 });
  }
}
