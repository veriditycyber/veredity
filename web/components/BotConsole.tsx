"use client";

import { useEffect, useRef, useState } from "react";
import Scorecard from "./Scorecard";
import { Camera, Sparkle, Check, Alert, Shield } from "./icons";

type Integrity = { flags: { label: string; status: "ok" | "warn" | "risk"; detail: string }[]; integrityScore?: number };
type S = {
  id: string; status: string; platform?: string; candidateName?: string; role?: string;
  transcript: string; notes?: string; report?: any; integrity?: Integrity | null;
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled", manual: "Manual", joining: "Bot joining…", in_call: "In call — live",
  processing: "Wrapping up…", done: "Complete", failed: "Failed",
};
const LIVE = new Set(["scheduled", "joining", "in_call", "processing"]);

export default function BotConsole({ initial }: { initial: S }) {
  const [s, setS] = useState<S>(initial);
  const [manualTx, setManualTx] = useState("");
  const [busy, setBusy] = useState<"" | "report" | "notes" | "save">("");
  const [err, setErr] = useState("");
  const txRef = useRef<HTMLDivElement>(null);
  const isManual = s.platform === "manual" || s.status === "manual";

  // Live polling while the bot is active.
  useEffect(() => {
    if (!LIVE.has(s.status) || isManual) return;
    const t = setInterval(async () => {
      try {
        const d = await fetch(`/api/bot/${s.id}`).then((r) => r.json());
        if (d?.id) setS((prev) => ({ ...prev, ...d }));
      } catch {}
    }, 3500);
    return () => clearInterval(t);
  }, [s.status, s.id, isManual]);

  useEffect(() => { if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight; }, [s.transcript]);

  async function act(action: string, extra?: object): Promise<any> {
    const r = await fetch(`/api/bot/${s.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    return r.json();
  }

  async function saveManual() {
    if (manualTx.trim().length < 60) { setErr("Paste a longer transcript (a few lines minimum)."); return; }
    setBusy("save"); setErr("");
    const d = await act("manual_transcript", { transcript: manualTx });
    setS((prev) => ({ ...prev, transcript: d.transcript || manualTx, status: "processing" }));
    setBusy("");
  }
  async function makeNotes() {
    setBusy("notes"); setErr("");
    const d = await act("notes");
    setS((prev) => ({ ...prev, notes: d.notes || prev.notes }));
    setBusy("");
  }
  async function makeReport() {
    setBusy("report"); setErr("");
    const d = await act("report", isManual ? { transcript: manualTx || s.transcript } : {});
    if (d.ok) setS((prev) => ({ ...prev, status: "done", report: d.report, integrity: d.integrity ? { ...d.integrity } : prev.integrity }));
    else setErr(d.message || "Could not generate the report.");
    setBusy("");
  }
  async function endCall() {
    setBusy("report"); await act("stop"); setS((prev) => ({ ...prev, status: "processing" }));
    await makeReport();
  }

  const hasTranscript = (s.transcript || "").trim().length > 40;

  return (
    <div className="bot-console">
      <div className="bot-topline noprint">
        <span className={`pill ${s.status === "in_call" ? "secure" : ""}`}>
          <span className={`status-dot ${s.status === "done" ? "completed" : "active"}`} /> {STATUS_LABEL[s.status] || s.status}
        </span>
        {s.platform && s.platform !== "manual" && <span className="pill"><Camera /> {s.platform}</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!isManual && s.status === "in_call" && <button className="btn btn-ghost" onClick={makeNotes} disabled={!!busy}>{busy === "notes" ? "…" : "Refresh notes"}</button>}
          {!isManual && (s.status === "in_call" || s.status === "processing") && <button className="btn btn-primary" onClick={endCall} disabled={!!busy}>End &amp; report</button>}
          {s.status === "done" && <button className="btn btn-ghost" onClick={() => window.print()}>Print / PDF</button>}
        </div>
      </div>

      {/* Manual transcript entry */}
      {isManual && s.status !== "done" && (
        <div className="card noprint">
          <p className="section-title" style={{ margin: "0 0 4px" }}>Interview transcript</p>
          <p className="hint" style={{ marginBottom: 10 }}>Paste the transcript (or your notes) from the call. Then generate the report.</p>
          <textarea className="input ta" rows={8} value={manualTx || s.transcript} onChange={(e) => setManualTx(e.target.value)} placeholder="Interviewer: Tell me about a system you designed…&#10;Candidate: …" />
          {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={makeReport} disabled={busy === "report"}><Sparkle /> {busy === "report" ? "Analyzing…" : "Generate report"}</button>
          </div>
        </div>
      )}

      {/* Live transcript + notes (bot mode) */}
      {!isManual && s.status !== "done" && (
        <div className="bot-live noprint">
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 10px" }}>Live transcript</p>
            <div className="bot-transcript" ref={txRef}>
              {hasTranscript ? s.transcript : <span className="muted">Waiting for the bot to join and the conversation to start…</span>}
            </div>
          </div>
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 10px" }}>Live notes</p>
            {s.notes ? <div className="bot-notes">{s.notes}</div> : <div className="empty" style={{ padding: "28px 12px" }}><Sparkle /><div>Notes appear as the interview progresses.</div></div>}
          </div>
        </div>
      )}

      {err && !isManual && <p className="err">{err}</p>}

      {/* Final report */}
      {s.status === "done" && s.report && (
        <>
          <div className="card">
            <div className="report-title">
              <h3>Interview report</h3>
              <span className="muted">{[s.candidateName, s.role].filter(Boolean).join(" · ")}{s.report.model ? ` · ${s.report.model}` : ""}</span>
            </div>
            <Scorecard a={s.report} meta={s.candidateName ? `${s.candidateName}${s.role ? ` · ${s.role}` : ""}` : undefined} />
          </div>

          {s.integrity && s.integrity.flags?.length > 0 && (
            <div className="card">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <p className="section-title" style={{ margin: 0 }}><Shield style={{ width: 14, height: 14, verticalAlign: "-2px" }} /> Interview integrity</p>
                {typeof s.integrity.integrityScore === "number" && <span className={`badge ${s.integrity.integrityScore >= 70 ? "green" : s.integrity.integrityScore >= 40 ? "yellow" : "red"}`}>{s.integrity.integrityScore}/100</span>}
              </div>
              <div className="trust-signals">
                {s.integrity.flags.map((fl, i) => (
                  <div key={i} className={`trust-sig ${fl.status}`}>
                    <span className="ts-ic">{fl.status === "ok" ? <Check /> : <Alert />}</span>
                    <div><b>{fl.label}</b><span>{fl.detail}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.transcript && (
            <details className="card">
              <summary className="section-title" style={{ cursor: "pointer", margin: 0 }}>Full transcript</summary>
              <pre className="transcript" style={{ marginTop: 12 }}>{s.transcript}</pre>
            </details>
          )}
        </>
      )}
    </div>
  );
}
