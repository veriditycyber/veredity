"use client";

import { useState } from "react";
import { BandBadge } from "./Badge";
import { Shield } from "./icons";

type Res = { candidateName?: string | null; email?: string | null; score: number | null; band: string };

function parseLines(text: string) {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const p = line.split(",").map((x) => x.trim());
    return { candidateName: p[0] || undefined, email: p[1] || undefined, phone: p[2] || undefined, claimedCountry: p[3] || undefined };
  });
}

export default function BulkScreen() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [results, setResults] = useState<Res[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; green: number; yellow: number; red: number } | null>(null);

  const candidates = parseLines(text);

  async function run() {
    if (candidates.length === 0) { setErr("Add at least one candidate line."); return; }
    setBusy(true); setErr(""); setResults(null);
    try {
      const d = await fetch("/api/trust/bulk", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidates }) }).then((r) => r.json());
      if (d.results) { setResults(d.results); setSummary(d.summary); }
      else setErr(d.message || "Screening failed.");
    } catch { setErr("Network error."); } finally { setBusy(false); }
  }

  function exportCsv() {
    if (!results) return;
    const rows = [["Candidate", "Email", "Score", "Band"], ...results.map((r) => [r.candidateName || "", r.email || "", r.score ?? "", r.band])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "truehire-bulk-screen.csv"; a.click();
  }

  return (
    <div className="card">
      <p className="section-title" style={{ margin: "0 0 4px" }}>Paste candidates</p>
      <p className="hint" style={{ marginBottom: 10 }}>One per line: <span className="mono">Name, email, phone (+country code), country (ISO-2)</span>. Up to 50. Blank fields are fine.</p>
      <textarea className="input ta" rows={7} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={"Priya Sharma, priya@acme.com, +919876543210, IN\nJohn Doe, jdoe@mailinator.com, +79991234567, US"} />
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" disabled={busy || candidates.length === 0} onClick={run}><Shield /> {busy ? `Screening ${candidates.length}…` : `Screen ${candidates.length || ""} candidate${candidates.length === 1 ? "" : "s"}`}</button>
        {results && <button className="btn btn-ghost" onClick={exportCsv}>Export CSV</button>}
      </div>

      {summary && (
        <div className="grid-stats" style={{ marginTop: 18 }}>
          <div className="stat"><div className="l">Screened</div><div className="n">{summary.total}</div></div>
          <div className="stat"><div className="l">Trusted</div><div className="n">{summary.green}</div></div>
          <div className="stat"><div className="l">Review</div><div className="n">{summary.yellow}</div></div>
          <div className="stat red"><div className="l">High risk</div><div className="n">{summary.red}</div></div>
        </div>
      )}

      {results && (
        <table className="table" style={{ marginTop: 16 }}>
          <thead><tr><th>Candidate</th><th>Email</th><th>Score</th><th>Band</th></tr></thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.candidateName || "—"}</td>
                <td className="muted">{r.email || "—"}</td>
                <td className="mono">{r.score ?? "—"}</td>
                <td><BandBadge band={r.band} status="DONE" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
