"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkle } from "./icons";

export default function BotStart({ recallReady }: { recallReady: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ meetingUrl: "", candidateName: "", role: "" });
  const [mode, setMode] = useState<"live" | "manual">(recallReady ? "live" : "manual");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function go() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/bot/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, meetingUrl: mode === "live" ? f.meetingUrl : "" }),
      });
      const d = await r.json();
      if (d.id) { router.push(`/bot/${d.id}`); return; }
      setMsg(d.message || "Could not start."); setBusy(false);
    } catch { setMsg("Network error."); setBusy(false); }
  }

  return (
    <div className="card">
      <div className="seg" style={{ marginBottom: 16 }}>
        <button className={mode === "live" ? "on" : ""} onClick={() => setMode("live")}><Camera /> Join a live meeting</button>
        <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}><Sparkle /> Paste a transcript</button>
      </div>

      {mode === "live" && (
        <>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Meeting link <span className="hint">(Zoom, Google Meet, or Teams)</span></label>
            <input className="input" placeholder="https://zoom.us/j/…  or  meet.google.com/…" value={f.meetingUrl} onChange={set("meetingUrl")} />
          </div>
          {!recallReady && <p className="hint" style={{ marginBottom: 12, color: "var(--muted)" }}>Live join needs <span className="mono">RECALL_API_KEY</span>. Until then, use “Paste a transcript”.</p>}
        </>
      )}

      <div className="trust-grid">
        <input className="input" placeholder="Candidate name (optional)" value={f.candidateName} onChange={set("candidateName")} />
        <input className="input" placeholder="Role, e.g. Backend Engineer" value={f.role} onChange={set("role")} />
      </div>

      {msg && <p className="err" style={{ marginTop: 10 }}>{msg}</p>}
      <div className="actions" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={busy || (mode === "live" && (!recallReady || !f.meetingUrl.trim()))} onClick={go}>
          <Camera /> {busy ? "Starting…" : mode === "live" ? "Send bot to meeting" : "Start manual session"}
        </button>
        <span className="hint">{mode === "live" ? "The bot joins, transcribes live, and takes notes." : "Paste the transcript on the next screen to get notes, integrity & a report."}</span>
      </div>
    </div>
  );
}
