"use client";

import { useState } from "react";
import BillingButton from "./BillingButton";
import StripeButton from "./StripeButton";
import { Check } from "./icons";

export type PlanRow = { key: string; name: string; inr: string; usd: string; per: string; features: string[]; featured: boolean };

export default function PlanGrid({ plans, current, razorpayReady, stripeReady }: { plans: PlanRow[]; current: string; razorpayReady: boolean; stripeReady: boolean }) {
  const [region, setRegion] = useState<"in" | "intl">(razorpayReady || !stripeReady ? "in" : "intl");
  const intl = region === "intl";

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div className="seg">
          <button className={!intl ? "on" : ""} onClick={() => setRegion("in")}>🇮🇳 India · UPI &amp; cards</button>
          <button className={intl ? "on" : ""} onClick={() => setRegion("intl")}>🌐 International · card</button>
        </div>
        <span className="hint">{intl ? "Billed in USD via Stripe." : "Billed in INR via Razorpay (UPI, cards, netbanking)."}</span>
      </div>

      <div className="plan-grid">
        {plans.map((p) => {
          const isCur = p.key === current;
          const price = p.key === "free" ? p.inr === p.usd ? p.inr : (intl ? p.usd : p.inr) : intl ? p.usd : p.inr;
          return (
            <div key={p.key} className={`plan${isCur ? " current" : ""}${p.featured ? " featured" : ""}`}>
              {p.featured && <span className="plan-tag">Most popular</span>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{price}<span>{p.per}</span></div>
              <ul className="plan-feat">{p.features.map((f, i) => <li key={i}><span className="sig-ok"><Check /></span> {f}</li>)}</ul>
              {isCur ? <button className="btn btn-block" disabled>Current plan</button>
                : p.key === "free" ? <button className="btn btn-block" disabled>—</button>
                : intl ? <StripeButton plan={p.key} label={`Upgrade to ${p.name}`} />
                : <BillingButton plan={p.key} label={`Upgrade to ${p.name}`} />}
            </div>
          );
        })}
      </div>
    </>
  );
}
