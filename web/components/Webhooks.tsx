"use client";

import { useEffect, useState } from "react";

type Hook = { id: string; url: string; events: string; active: boolean; lastStatus?: number | null; lastAt?: string | null };

export default function Webhooks() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<{ secret: string; url: string } | null>(null);

  async function load() { const d = await fetch("/api/account/webhooks").then((r) => r.json()).catch(() => ({ hooks: [], events: [] })); setHooks(d.hooks || []); setEvents(d.events || []); }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!url.trim() || busy) return;
    setBusy(true);
    try {
      const d = await fetch("/api/account/webhooks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", url }) }).then((r) => r.json());
      if (d.secret) { setFresh({ secret: d.secret, url: d.url }); setUrl(""); load(); }
    } finally { setBusy(false); }
  }
  async function del(id: string) { await fetch("/api/account/webhooks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id }) }); load(); }

  return (
    <div className="row-gap">
      <div className="actions">
        <input className="input" placeholder="https://your-app.com/webhooks/truehire" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1, minWidth: 260 }} />
        <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? "Adding…" : "Add endpoint"}</button>
      </div>
      <p className="hint" style={{ margin: 0 }}>Events: {events.join(", ") || "—"}. Deliveries are signed (HMAC-SHA256) in <span className="mono">X-TrueHire-Signature</span>.</p>

      {fresh && (
        <div className="card" style={{ background: "var(--panel2)" }}>
          <p className="hint" style={{ margin: "0 0 6px", color: "var(--text)" }}>Signing secret for <b>{fresh.url}</b> — copy now, shown once:</p>
          <div className="key-reveal"><code className="mono">{fresh.secret}</code><button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(fresh.secret)}>Copy</button></div>
          <button className="hint" style={{ marginTop: 8, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }} onClick={() => setFresh(null)}>Done</button>
        </div>
      )}

      {hooks.length === 0 ? <p className="hint">No webhooks yet.</p> : (
        <table className="table">
          <thead><tr><th>Endpoint</th><th>Events</th><th>Last delivery</th><th></th></tr></thead>
          <tbody>
            {hooks.map((h) => (
              <tr key={h.id}>
                <td className="mono" style={{ fontSize: 12, wordBreak: "break-all" }}>{h.url}</td>
                <td className="muted">{h.events}</td>
                <td className="muted">{h.lastAt ? `${h.lastStatus} · ${new Date(h.lastAt).toLocaleDateString()}` : "never"}</td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" onClick={() => del(h.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
