"use client";

import { useState } from "react";

const OPTIONS = [
  { v: "", label: "Keep forever" },
  { v: "30", label: "30 days" },
  { v: "90", label: "90 days" },
  { v: "180", label: "180 days" },
  { v: "365", label: "1 year" },
];

export default function ComplianceSettings({ initial }: { initial: number | null }) {
  const [days, setDays] = useState<string>(initial ? String(initial) : "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(v: string) {
    setDays(v); setBusy(true); setMsg("");
    try {
      const d = await fetch("/api/compliance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "set_retention", retentionDays: v === "" ? null : v }) }).then((r) => r.json());
      if (d.ok) setMsg("Saved.");
    } finally { setBusy(false); }
  }
  async function purge() {
    setBusy(true); setMsg("");
    try {
      const d = await fetch("/api/compliance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "purge_now" }) }).then((r) => r.json());
      setMsg(d.ok ? `Purged ${d.total} record${d.total === 1 ? "" : "s"} older than the retention window.` : (d.message || "Nothing to purge."));
    } finally { setBusy(false); }
  }

  return (
    <div className="row-gap">
      <div className="flex-between" style={{ flexWrap: "wrap", gap: 10 }}>
        <span className="muted" style={{ fontSize: 14 }}>Auto-delete candidate data older than {msg && <span style={{ color: "var(--text)" }}>· {msg}</span>}</span>
        <select className="input" value={days} onChange={(e) => save(e.target.value)} disabled={busy} style={{ maxWidth: 180 }}>
          {OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
      </div>
      {days && <div className="actions"><button className="btn btn-ghost" onClick={purge} disabled={busy}>{busy ? "Working…" : "Purge expired now"}</button></div>}
    </div>
  );
}
