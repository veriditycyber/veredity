import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// Stripe-ready upgrade endpoint. When STRIPE_SECRET_KEY + price IDs are set,
// create a Stripe Checkout session here and return its url. Until then it
// returns a friendly message so the UI degrades gracefully.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ message: "Self-serve upgrades aren't enabled yet — connect Stripe to turn them on. Contact us to upgrade in the meantime." });
  }

  // TODO: const session = await stripe.checkout.sessions.create({ ... }); return { url: session.url }
  return NextResponse.json({ message: "Stripe is connected, but checkout isn't wired yet." });
}
