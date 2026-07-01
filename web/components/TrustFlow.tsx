"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";
import { Shield, Check, Alert } from "./icons";

const COUNTRIES = [
  ["", "Claimed country (optional)"], ["US", "United States"], ["IN", "India"], ["GB", "United Kingdom"],
  ["CA", "Canada"], ["AU", "Australia"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"],
  ["SG", "Singapore"], ["AE", "UAE"], ["PH", "Philippines"], ["PK", "Pakistan"], ["BD", "Bangladesh"],
  ["NG", "Nigeria"], ["BR", "Brazil"], ["MX", "Mexico"], ["JP", "Japan"], ["CN", "China"], ["RU", "Russia"],
];

type Signal = { key: string; label: string; status: "ok" | "warn" | "risk"; detail: string };
type Result = { id: string; score: number; band: "green" | "yellow" | "red"; signals: Signal[]; resumeFlag?: string };

const BAND_LABEL = { green: "Trusted", yellow: "Review needed", red: "High risk" } as const;

export default function TrustFlow() {
  const [f, setF] = useState({ candidateName: "", email: "", phone: "", claimedCountry: "", resumeText: "" });
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/trust", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, model }) });
      const d = await r.json();
      if (r.ok) setRes(d); else setErr(d.message || "Could not score this candidate.");
    } catch { setErr("Network error. Try again."); } finally { setBusy(false); }
  }

  if (res) {
    const grouped = { risk: res.signals.filter(s => s.status === "risk"), warn: res.signals.filter(s => s.status === "warn"), ok: res.signals.filter(s => s.status === "ok") };
    return (
      <div className="card">
        <div className={`trust-head ${res.band}`}>
          <div className="trust-gauge">
            <div className="tg-num">{res.score}</div>
            <div className="tg-cap">/ 100</div>
          </div>
          <div>
            <div className="trust-band">{BAND_LABEL[res.band]}</div>
            <p className="hint" style={{ margin: "4px 0 0", maxWidth: 420 }}>
              Trust score fuses email, phone, location, résumé and any linked deepfake check. It&apos;s a fraud signal — your recruiter always decides.
            </p>
          </div>
        </div>

        <div className="trust-signals">
          {[...grouped.risk, ...grouped.warn, ...grouped.ok].map((s) => (
            <div key={s.key} className={`trust-sig ${s.status}`}>
              <span className="ts-ic">{s.status === "risk" ? <Alert /> : s.status === "warn" ? <Alert /> : <Check />}</span>
              <div><b>{s.label}</b><span>{s.detail}</span></div>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="btn btn-ghost" onClick={() => { setRes(null); }}>Score another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <p className="section-title" style={{ margin: 0 }}>Candidate signals</p>
        <ModelPicker value={model} onChange={setModel} compact />
      </div>
      <div className="trust-grid">
        <input className="input" placeholder="Candidate name (optional)" value={f.candidateName} onChange={set("candidateName")} />
        <select className="input" value={f.claimedCountry} onChange={set("claimedCountry")}>
          {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="input" type="email" placeholder="Candidate email" value={f.email} onChange={set("email")} />
        <input className="input" placeholder="Phone (with country code, e.g. +1…)" value={f.phone} onChange={set("phone")} />
      </div>
      <textarea className="input ta" style={{ marginTop: 10 }} rows={6} placeholder="Paste the candidate's résumé text (optional — enables AI authenticity analysis)…" value={f.resumeText} onChange={set("resumeText")} />
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" disabled={busy} onClick={run}><Shield /> {busy ? "Scoring…" : "Score candidate"}</button>
        <span className="hint">Checks disposable email, domain deliverability, phone validity, location consistency &amp; résumé authenticity.</span>
      </div>
    </div>
  );
}
