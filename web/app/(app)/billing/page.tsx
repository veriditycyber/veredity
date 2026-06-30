import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, planOf, type Plan } from "@/lib/plans";
import Topbar from "@/components/Topbar";
import BillingButton from "@/components/BillingButton";
import CancelButton from "@/components/CancelButton";
import { Check } from "@/components/icons";

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

  return (
    <>
      <Topbar title="Billing & Plans" crumb="Subscription" />
      <div className="content">
        <div className="page-head">
          <h2>Plans</h2>
          <p>You&apos;re on the <b style={{ color: "var(--text)" }}>{PLANS[current].name}</b> plan. Upgrade as your hiring volume grows. Prices in INR, billed monthly via Razorpay.</p>
        </div>

        {sub && current !== "free" && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <p className="section-title" style={{ margin: "0 0 6px" }}>Your subscription</p>
                <div style={{ fontSize: 15 }}>
                  <b>{PLANS[planOf(sub.plan)].name}</b> · <span className="muted">{STATUS_LABEL[sub.status] || sub.status}</span>
                  {sub.cancelAtPeriodEnd && <span className="muted"> · ends at period close</span>}
                  {sub.currentPeriodEnd && <span className="muted"> · renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>}
                </div>
              </div>
              {!sub.cancelAtPeriodEnd && <CancelButton />}
            </div>
          </div>
        )}

        <div className="plan-grid">
          {order.map((k) => {
            const p = PLANS[k];
            const isCur = k === current;
            return (
              <div key={k} className={`plan${isCur ? " current" : ""}${k === "pro" ? " featured" : ""}`}>
                {k === "pro" && <span className="plan-tag">Most popular</span>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">{p.price}<span>{p.per}</span></div>
                <ul className="plan-feat">{p.features.map((f, i) => <li key={i}><span className="sig-ok"><Check /></span> {f}</li>)}</ul>
                {isCur ? <button className="btn btn-block" disabled>Current plan</button> : k === "free" ? <button className="btn btn-block" disabled>—</button> : <BillingButton plan={k} label={`Upgrade to ${p.name}`} />}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <p className="section-title" style={{ margin: "0 0 8px" }}>Payments</p>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Payments are processed securely by Razorpay (UPI, cards, netbanking). Veridity never sees your card details.
            Cancel anytime — your plan stays active until the end of the billing period.
          </p>
        </div>
      </div>
    </>
  );
}
