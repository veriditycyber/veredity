"use client";

import { useEffect, useState } from "react";
import { Alert as AlertIcon, Check } from "./icons";

type A = { id: string; candidateName?: string | null; band: string; source: string; message: string; read: boolean; createdAt: string };
const SOURCE: Record<string, string> = { trust: "Trust Score", bulk: "Bulk screen", monitor: "Monitoring", link: "Verification link" };

export default function AlertList() {
  const [alerts, setAlerts] = useState<A[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() { const d = await fetch("/api/alerts").then((r) => r.json()).catch(() => ({ alerts: [] })); setAlerts(d.alerts || []); setLoaded(true); }
  useEffect(() => { load(); }, []);

  async function act(action: string, id?: string) { await fetch("/api/alerts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id }) }); load(); }

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>Alerts{unread > 0 ? ` · ${unread} new` : ""}</p>
        {alerts.length > 0 && (
          <div className="actions" style={{ margin: 0 }}>
            {unread > 0 && <button className="btn btn-ghost" onClick={() => act("read_all")}>Mark all read</button>}
            <button className="btn btn-ghost" onClick={() => act("clear")}>Clear</button>
          </div>
        )}
      </div>

      {!loaded ? null : alerts.length === 0 ? (
        <div className="empty"><Check /><div>No alerts. You&apos;ll be notified here when a high-risk candidate is flagged.</div></div>
      ) : (
        <div className="alert-list">
          {alerts.map((a) => (
            <div key={a.id} className={`alert-row${a.read ? " read" : ""}`}>
              <span className="ar-ic"><AlertIcon /></span>
              <div className="ar-body">
                <div className="ar-msg">{a.message}</div>
                <div className="ar-meta">{SOURCE[a.source] || a.source} · {new Date(a.createdAt).toLocaleString()}</div>
              </div>
              {!a.read && <button className="chip-btn" onClick={() => act("read", a.id)}>Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
