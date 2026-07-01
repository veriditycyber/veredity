"use client";

import { useState } from "react";

export default function SlackSettings({ initial }: { initial: string | null }) {
  const [url, setUrl] = useState(initial || "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setMsg("");
    try { const d = await fetch("/api/account/slack", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) }).then((r) => r.json()); setMsg(d.ok ? "Saved." : (d.message || "Failed.")); }
    finally { setBusy(false); }
  }
  async function test() {
    setBusy(true); setMsg("");
    try { const d = await fetch("/api/account/slack", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ test: true }) }).then((r) => r.json()); setMsg(d.message || (d.ok ? "Sent." : "Failed.")); }
    finally { setBusy(false); }
  }

  return (
    <div className="row-gap">
      <div className="field" style={{ margin: 0 }}>
        <label>Slack incoming webhook URL</label>
        <input className="input mono" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.slack.com/services/…" style={{ fontSize: 12 }} />
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "…" : "Save"}</button>
        <button className="btn btn-ghost" onClick={test} disabled={busy}>Send test</button>
        {msg && <span className="hint">{msg}</span>}
      </div>
    </div>
  );
}
