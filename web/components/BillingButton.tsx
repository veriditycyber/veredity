"use client";

import { useState } from "react";
import { Card } from "./icons";

export default function BillingButton({ plan, label }: { plan: string; label: string }) {
  const [msg, setMsg] = useState("");
  async function go() {
    setMsg("");
    try {
      const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
      const d = await r.json();
      if (d.url) location.href = d.url;
      else setMsg(d.message || "Billing isn't enabled yet.");
    } catch { setMsg("Couldn't start checkout. Try again."); }
  }
  return (
    <>
      <button className="btn btn-primary btn-block" onClick={go}><Card /> {label}</button>
      {msg && <p className="hint" style={{ marginTop: 8, textAlign: "center" }}>{msg}</p>}
    </>
  );
}
