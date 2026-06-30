"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);

  async function cancel() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/billing/cancel", { method: "POST" });
      const d = await r.json();
      setMsg(d.message || (d.ok ? "Cancelled." : "Could not cancel."));
      if (d.ok) router.refresh();
    } catch { setMsg("Network error."); } finally { setBusy(false); setConfirm(false); }
  }

  if (!confirm) {
    return <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Cancel subscription</button>;
  }
  return (
    <div className="actions">
      <button className="btn btn-ghost" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Confirm cancel"}</button>
      <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Keep plan</button>
      {msg && <span className="hint">{msg}</span>}
    </div>
  );
}
