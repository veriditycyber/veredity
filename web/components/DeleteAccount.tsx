"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function del() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/account/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: text }) });
      const d = await r.json();
      if (d.ok) { router.push("/"); router.refresh(); return; }
      setMsg(d.message || "Could not delete."); setBusy(false);
    } catch { setMsg("Network error."); setBusy(false); }
  }

  if (!open) {
    return <button className="btn btn-danger" onClick={() => setOpen(true)}>Delete account</button>;
  }
  return (
    <div className="row-gap">
      <p className="hint">This permanently deletes your account and all data — checks, interviews, Forge sessions, and subscription records. This cannot be undone.</p>
      <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder='Type DELETE to confirm' style={{ maxWidth: 260 }} />
      <div className="actions">
        <button className="btn btn-danger" disabled={busy || text !== "DELETE"} onClick={del}>{busy ? "Deleting…" : "Permanently delete"}</button>
        <button className="btn btn-ghost" onClick={() => { setOpen(false); setText(""); }}>Cancel</button>
        {msg && <span className="hint" style={{ color: "var(--danger)" }}>{msg}</span>}
      </div>
    </div>
  );
}
