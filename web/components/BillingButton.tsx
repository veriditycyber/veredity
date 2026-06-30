"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./icons";

declare global { interface Window { Razorpay?: any } }

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BillingButton({ plan, label }: { plan: string; label: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setMsg(""); setBusy(true);
    try {
      const r = await fetch("/api/billing/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
      const d = await r.json();
      if (!r.ok) { setMsg(d.message || "Billing isn't enabled yet."); setBusy(false); return; }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        // Fallback to Razorpay's hosted page.
        if (d.shortUrl) { location.href = d.shortUrl; return; }
        setMsg("Couldn't load the checkout. Try again."); setBusy(false); return;
      }

      const rzp = new window.Razorpay({
        key: d.keyId,
        subscription_id: d.subscriptionId,
        name: "Veridity",
        description: `${label}`,
        prefill: { name: d.name, email: d.email },
        theme: { color: "#0a0a0c" },
        handler: async (resp: any) => {
          await fetch("/api/billing/verify", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify(resp),
          });
          router.refresh();
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => { setMsg("Payment failed. No charge was made."); setBusy(false); });
      rzp.open();
    } catch { setMsg("Couldn't start checkout. Try again."); setBusy(false); }
  }

  return (
    <>
      <button className="btn btn-primary btn-block" onClick={go} disabled={busy}><Card /> {busy ? "Starting…" : label}</button>
      {msg && <p className="hint" style={{ marginTop: 8, textAlign: "center" }}>{msg}</p>}
    </>
  );
}
