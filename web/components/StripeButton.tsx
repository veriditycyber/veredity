"use client";

import { useState } from "react";
import { Card } from "./icons";

export default function StripeButton({ plan, label }: { plan: string; label: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setMsg(""); setBusy(true);
    try {
      const r = await fetch("/api/billing/stripe/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
      const d = await r.json();
      if (d.url) { location.href = d.url; return; }
      setMsg(d.message || "International payments aren't enabled yet."); setBusy(false);
    } catch { setMsg("Couldn't start checkout. Try again."); setBusy(false); }
  }

  return (
    <>
      <button className="btn btn-primary btn-block" onClick={go} disabled={busy}><Card /> {busy ? "Starting…" : label}</button>
      {msg && <p className="hint" style={{ marginTop: 8, textAlign: "center" }}>{msg}</p>}
    </>
  );
}
