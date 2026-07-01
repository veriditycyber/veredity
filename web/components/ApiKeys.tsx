"use client";

import { useEffect, useState } from "react";

type Key = { id: string; name: string; prefix: string; lastUsedAt?: string | null; createdAt: string };

export default function ApiKeys() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<{ name: string; key: string } | null>(null);

  async function load() {
    const d = await fetch("/api/account/keys").then((r) => r.json()).catch(() => ({ keys: [] }));
    setKeys(d.keys || []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (busy) return;
    setBusy(true);
    try {
      const d = await fetch("/api/account/keys", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", name: name || "API key" }) }).then((r) => r.json());
      if (d.key) { setFresh({ name: d.name, key: d.key }); setName(""); load(); }
    } finally { setBusy(false); }
  }
  async function revoke(id: string) {
    await fetch("/api/account/keys", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "revoke", id }) });
    load();
  }

  return (
    <div className="row-gap">
      <div className="actions">
        <input className="input" placeholder="Key name (e.g. Greenhouse integration)" value={name} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 320 }} />
        <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? "Creating…" : "Create key"}</button>
      </div>

      {fresh && (
        <div className="card" style={{ background: "var(--panel2)" }}>
          <p className="hint" style={{ margin: "0 0 6px", color: "var(--text)" }}><b>{fresh.name}</b> — copy this now, it won&apos;t be shown again:</p>
          <div className="key-reveal">
            <code className="mono">{fresh.key}</code>
            <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(fresh.key)}>Copy</button>
          </div>
          <button className="hint" style={{ marginTop: 8, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }} onClick={() => setFresh(null)}>Done</button>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="hint">No API keys yet.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Name</th><th>Key</th><th>Last used</th><th></th></tr></thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td className="mono">{k.prefix}…</td>
                <td className="muted">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "never"}</td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" onClick={() => revoke(k.id)}>Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
