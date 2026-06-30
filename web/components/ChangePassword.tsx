"use client";

import { useState } from "react";

export default function ChangePassword({ hasPassword }: { hasPassword: boolean }) {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(""); setOk(false);
    try {
      const r = await fetch("/api/account/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword: cur, newPassword: pw }) });
      const d = await r.json();
      setOk(!!d.ok); setMsg(d.message || (d.ok ? "Saved." : "Failed."));
      if (d.ok) { setCur(""); setPw(""); }
    } catch { setMsg("Network error."); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="row-gap">
      {hasPassword && (
        <div className="field" style={{ margin: 0 }}>
          <label>Current password</label>
          <input className="input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="••••••••" />
        </div>
      )}
      <div className="field" style={{ margin: 0 }}>
        <label>{hasPassword ? "New password" : "Set a password"} <span className="hint">(8+ characters)</span></label>
        <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="actions">
        <button className="btn btn-primary" disabled={busy || pw.length < 8} type="submit">{busy ? "Saving…" : hasPassword ? "Update password" : "Set password"}</button>
        {msg && <span className="hint" style={{ color: ok ? "var(--text)" : "var(--danger)" }}>{msg}</span>}
      </div>
    </form>
  );
}
