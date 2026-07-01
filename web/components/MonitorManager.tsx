"use client";

import { useEffect, useState } from "react";
import { BandBadge } from "./Badge";
import { Clock } from "./icons";

type M = {
  id: string; subjectName?: string | null; email?: string | null; phone?: string | null;
  intervalDays: number; status: string; lastBand?: string | null; lastScore?: number | null;
  nextDueAt: string; lastRunAt?: string | null; runs: number;
};

export default function MonitorManager() {
  const [list, setList] = useState<M[]>([]);
  const [f, setF] = useState({ subjectName: "", email: "", phone: "", claimedCountry: "", intervalDays: 30 });
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState<string>("");

  async function load() { const d = await fetch("/api/monitor").then((r) => r.json()).catch(() => ({ monitors: [] })); setList(d.monitors || []); }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!f.subjectName && !f.email && !f.phone) return;
    setBusy(true);
    try { await fetch("/api/monitor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", ...f }) }); setF({ subjectName: "", email: "", phone: "", claimedCountry: "", intervalDays: 30 }); load(); }
    finally { setBusy(false); }
  }
  async function act(action: string, id: string) { await fetch("/api/monitor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id }) }); load(); }
  async function runNow(id: string) { setRunning(id); try { await fetch("/api/monitor/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }); await load(); } finally { setRunning(""); } }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <div className="card">
        <p className="section-title" style={{ margin: "0 0 12px" }}>Add someone to monitor</p>
        <div className="trust-grid">
          <input className="input" placeholder="Name" value={f.subjectName} onChange={set("subjectName")} />
          <input className="input" placeholder="Email" value={f.email} onChange={set("email")} />
          <input className="input" placeholder="Phone (+country code)" value={f.phone} onChange={set("phone")} />
          <select className="input" value={f.intervalDays} onChange={set("intervalDays")}>
            <option value={7}>Every week</option>
            <option value={30}>Every 30 days</option>
            <option value={90}>Every quarter</option>
          </select>
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={busy} onClick={add}><Clock /> {busy ? "Adding…" : "Add to monitoring"}</button>
          <span className="hint">Re-screens on schedule to catch account hand-offs and post-hire fraud.</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="section-title" style={{ margin: "0 0 6px" }}>Monitored</p>
        {list.length === 0 ? (
          <div className="empty"><Clock /><div>No one under monitoring yet.</div></div>
        ) : (
          <table className="table">
            <thead><tr><th>Subject</th><th>Every</th><th>Last</th><th>Next due</th><th></th></tr></thead>
            <tbody>
              {list.map((m) => {
                const due = new Date(m.nextDueAt) <= new Date();
                return (
                  <tr key={m.id}>
                    <td>{m.subjectName || m.email || m.phone || "—"}{m.status === "paused" && <span className="muted" style={{ fontSize: 12 }}> · paused</span>}</td>
                    <td className="muted">{m.intervalDays}d</td>
                    <td>{m.lastBand ? <BandBadge band={m.lastBand} status="DONE" /> : <span className="muted">—</span>}</td>
                    <td className={due ? "" : "muted"}>{due ? <b>due now</b> : new Date(m.nextDueAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost" onClick={() => runNow(m.id)} disabled={running === m.id}>{running === m.id ? "…" : "Run now"}</button>
                      <button className="btn btn-ghost" onClick={() => act(m.status === "paused" ? "resume" : "pause", m.id)}>{m.status === "paused" ? "Resume" : "Pause"}</button>
                      <button className="btn btn-ghost" onClick={() => act("remove", m.id)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
