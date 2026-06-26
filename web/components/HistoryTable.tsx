"use client";

import { useState } from "react";
import Link from "next/link";
import { BandBadge } from "./Badge";
import { Clock } from "./icons";

type Row = {
  id: string; candidateName: string | null; fileName: string;
  band: string | null; score: number | null; status: string; engine: string | null; createdAt: string;
};

const FILTERS = [
  { k: "all", label: "All" },
  { k: "green", label: "Genuine" },
  { k: "yellow", label: "Review" },
  { k: "red", label: "High risk" },
];

export default function HistoryTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");

  const filtered = rows.filter((r) => {
    if (f !== "all" && r.band !== f) return false;
    if (q) {
      const hay = `${r.candidateName || ""} ${r.fileName}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="card">
      <div className="hist-toolbar">
        <input className="input hist-search" placeholder="Search candidate or file…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="hist-filters">
          {FILTERS.map((x) => (
            <button key={x.k} className={`chip${f === x.k ? " on" : ""}`} onClick={() => setF(x.k)}>{x.label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><Clock /><div>No checks match your filter.</div></div>
      ) : (
        <table className="table">
          <thead><tr><th>Candidate / file</th><th>Result</th><th>Risk</th><th>Engine</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><Link className="row-link" href={`/history/${c.id}`}>{c.candidateName || c.fileName}</Link></td>
                <td><BandBadge band={c.band} status={c.status} /></td>
                <td className="mono">{c.score ?? "—"}</td>
                <td className="muted mono" style={{ fontSize: 12 }}>{c.engine || "—"}</td>
                <td className="muted">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="hint" style={{ marginTop: 12 }}>Showing {filtered.length} of {rows.length} checks</p>
    </div>
  );
}
