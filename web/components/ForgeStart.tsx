"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModelPicker from "./ModelPicker";
import { Flame } from "./icons";

export default function ForgeStart({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [ctx, setCtx] = useState("");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function start() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/forge/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decisionContext: ctx.trim(), model }) });
      if (model) { try { localStorage.setItem("veridity_forge_model", model); } catch {} }
      const d = await r.json();
      if (r.ok && d.sessionId) { router.push(`/forge/${d.sessionId}`); return; }
      setErr(d.message || d.error || "Could not start a session."); setBusy(false);
    } catch { setErr("Network error."); setBusy(false); }
  }

  return (
    <div className="card forge-start">
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <p className="section-title" style={{ margin: 0 }}>Start a session</p>
        {!disabled && <ModelPicker value={model} onChange={setModel} compact />}
      </div>
      <p className="hint" style={{ marginBottom: 12 }}>Name the decision you keep circling. Or leave it blank and let the coach find it.</p>
      <textarea className="input ta" rows={2} value={ctx} disabled={disabled || busy}
        onChange={(e) => setCtx(e.target.value)}
        placeholder="e.g. Whether to fire my first hire, or keep coaching him another month" />
      {err && <p className="hint" style={{ color: "var(--danger)", marginTop: 8 }}>{err}</p>}
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" disabled={disabled || busy} onClick={start}>
          <Flame /> {busy ? "Opening…" : "Begin"}
        </button>
        {disabled && <span className="hint">Coach needs an ANTHROPIC_API_KEY configured.</span>}
      </div>
    </div>
  );
}
