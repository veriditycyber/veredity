import { getCurrentUser } from "@/lib/auth";
import { PLANS, planOf, type Plan } from "@/lib/plans";
import Topbar from "@/components/Topbar";
import BillingButton from "@/components/BillingButton";
import { Check } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = (await getCurrentUser())!;
  const current = planOf(user.plan);
  const order: Plan[] = ["free", "pro", "business"];

  return (
    <>
      <Topbar title="Billing & Plans" crumb="Subscription" />
      <div className="content">
        <div className="page-head">
          <h2>Plans</h2>
          <p>You&apos;re on the <b style={{ color: "var(--text)" }}>{PLANS[current].name}</b> plan. Upgrade as your hiring volume grows.</p>
        </div>

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
                {isCur ? <button className="btn btn-block" disabled>Current plan</button> : <BillingButton plan={k} label={`Upgrade to ${p.name}`} />}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <p className="section-title" style={{ margin: "0 0 8px" }}>Payments</p>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Card payments are processed securely by Stripe. Connect Stripe (set <span className="mono">STRIPE_SECRET_KEY</span> and price IDs) to enable self-serve upgrades.
          </p>
        </div>
      </div>
    </>
  );
}
