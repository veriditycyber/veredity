"use client";

import { useState } from "react";
import Scorecard from "./Scorecard";
import { Sparkle } from "./icons";

export default function InterviewAssistant() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tx, setTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<any>(null);

  async function analyze() {
    setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/interview", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: tx, candidateName: name, role }),
      });
      const d = await r.json();
      if (r.ok) setRes(d); else setErr(d.message || "Analysis failed.");
    } catch { setErr("Network error. Please try again."); } finally { setBusy(false); }
  }

  if (res) {
    return (
      <div className="card">
        <Scorecard a={res} meta={name ? `${name}${role ? ` · ${role}` : ""}` : undefined} />
        <div className="result-actions">
          <button className="btn btn-ghost" onClick={() => { setRes(null); setTx(""); }}>Analyze another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="actions" style={{ marginBottom: 12 }}>
        <input className="input" placeholder="Candidate name (optional)" value={name} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 240 }} />
        <input className="input" placeholder="Role, e.g. Backend Engineer" value={role} onChange={(e) => setRole(e.target.value)} style={{ maxWidth: 280 }} />
      </div>
      <textarea className="input ta" placeholder="Paste the interview transcript or your notes here…" value={tx} onChange={(e) => setTx(e.target.value)} rows={9} />
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" disabled={busy || tx.trim().length < 40} onClick={analyze}><Sparkle /> {busy ? "Analyzing…" : "Analyze interview"}</button>
        <span className="hint">Claude reads the transcript and scores fit, strengths, risks &amp; follow-up questions.</span>
      </div>
    </div>
  );
}
