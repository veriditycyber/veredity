import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, USD_PRICE, planOf, type Plan } from "@/lib/plans";
import { razorpayConfigured } from "@/lib/razorpay";
import { stripeConfigured } from "@/lib/stripe";
import Topbar from "@/components/Topbar";
import CancelButton from "@/components/CancelButton";
import PlanGrid, { type PlanRow } from "@/components/PlanGrid";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Active", created: "Awaiting payment", authenticated: "Authenticated",
  pending: "Payment pending", halted: "Halted — update payment", cancelled: "Cancelling",
  completed: "Completed", expired: "Expired",
};

export default async function BillingPage() {
  const user = (await getCurrentUser())!;
  const current = planOf(user.plan);
  const order: Plan[] = ["free", "pro", "business"];
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });

  const plans: PlanRow[] = order.map((k) => ({
    key: k, name: PLANS[k].name, inr: PLANS[k].price, usd: USD_PRICE[k], per: PLANS[k].per,
    features: PLANS[k].features, featured: k === "pro",
  }));

  return (
    <>
      <Topbar title="Billing & Plans" crumb="Subscription" />
      <div className="content">
        <div className="page-head">
          <h2>Plans</h2>
          <p>You&apos;re on the <b style={{ color: "var(--text)" }}>{PLANS[current].name}</b> plan. Pay in INR (Razorpay) or with an international card (Stripe).</p>
        </div>

        {sub && current !== "free" && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <p className="section-title" style={{ margin: "0 0 6px" }}>Your subscription</p>
                <div style={{ fontSize: 15 }}>
                  <b>{PLANS[planOf(sub.plan)].name}</b> · <span className="muted">{STATUS_LABEL[sub.status] || sub.status}</span>
                  <span className="muted"> · via {sub.provider === "stripe" ? "Stripe" : "Razorpay"}</span>
                  {sub.cancelAtPeriodEnd && <span className="muted"> · ends at period close</span>}
                  {sub.currentPeriodEnd && <span className="muted"> · renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>}
                </div>
              </div>
              {!sub.cancelAtPeriodEnd && <CancelButton />}
            </div>
          </div>
        )}

        <PlanGrid plans={plans} current={current} razorpayReady={razorpayConfigured()} stripeReady={stripeConfigured()} />

        <div className="card" style={{ marginTop: 18 }}>
          <p className="section-title" style={{ margin: "0 0 8px" }}>Payments</p>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Processed securely by Razorpay (UPI, cards, netbanking · INR) and Stripe (international cards · USD).
            Veridity never sees your card details. Cancel anytime — your plan stays active until the end of the billing period.
          </p>
        </div>
      </div>
    </>
  );
}
