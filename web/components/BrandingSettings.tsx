"use client";

import { useState } from "react";

export default function BrandingSettings({ initialName, initialColor }: { initialName: string | null; initialColor: string | null }) {
  const [name, setName] = useState(initialName || "");
  const [color, setColor] = useState(initialColor || "#111111");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setMsg("");
    try {
      const d = await fetch("/api/account/branding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ brandName: name, brandColor: color }) }).then((r) => r.json());
      setMsg(d.ok ? "Saved." : "Failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="row-gap">
      <div className="field" style={{ margin: 0 }}>
        <label>Brand name on shared reports</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Talent" style={{ maxWidth: 320 }} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Accent color</label>
        <div className="actions" style={{ margin: 0 }}>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 44, height: 38, padding: 2, borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel2)" }} />
          <input className="input mono" value={color} onChange={(e) => setColor(e.target.value)} style={{ maxWidth: 120 }} />
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save branding"}</button>
        {msg && <span className="hint">{msg}</span>}
      </div>
    </div>
  );
}
