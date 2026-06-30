"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { id: string; role: string; content: string };

export default function ForgeChat({
  sessionId, initial, status, insight,
}: { sessionId: string; initial: Msg[]; status: string; insight: string | null }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [closed, setClosed] = useState(status === "completed");
  const [panel, setPanel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commit, setCommit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clarity, setClarity] = useState(70);
  const [result, setResult] = useState<{ insight: string; pattern: string | null } | null>(insight ? { insight, pattern: null } : null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { id: "u" + Date.now(), role: "user", content: text }]);
    setSending(true);
    try {
      const r = await fetch("/api/forge/message", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, content: text }) });
      const d = await r.json();
      setMessages((m) => [...m, d.message || { id: "e" + Date.now(), role: "coach", content: "(coach unavailable — try again)" }]);
    } catch { setMessages((m) => [...m, { id: "e" + Date.now(), role: "coach", content: "(network error)" }]); }
    finally { setSending(false); }
  }

  async function doClose() {
    setBusy(true);
    try {
      const r = await fetch("/api/forge/close", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, commitmentText: commit, deadline, clarityScore: clarity }) });
      const d = await r.json();
      if (d.ok) { setClosed(true); setResult({ insight: d.insight, pattern: d.pattern }); }
    } finally { setBusy(false); }
  }

  return (
    <div className="forge-chat">
      <div className="fc-thread">
        {messages.map((m) => (
          <div key={m.id} className={`fc-msg ${m.role}`}><div className="fc-bubble">{m.content}</div></div>
        ))}
        {sending && <div className="fc-msg coach"><div className="fc-bubble fc-typing"><span /><span /><span /></div></div>}
        <div ref={endRef} />
      </div>

      {closed ? (
        <div className="card">
          <p className="section-title">Session closed</p>
          {result?.insight && <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 0 4px" }}>{result.insight}</p>}
          <div className="result-actions"><Link className="btn btn-primary" href="/forge">Back to Forge</Link></div>
        </div>
      ) : panel ? (
        <div className="card fc-close">
          <p className="section-title" style={{ margin: "0 0 4px" }}>Close &amp; commit</p>
          <p className="hint" style={{ marginBottom: 10 }}>One thing you&apos;ll do, by when — verbatim, exactly as you&apos;d say it.</p>
          <textarea className="input ta" value={commit} onChange={(e) => setCommit(e.target.value)} rows={2} placeholder="e.g. I'll tell my co-founder I want to change the equity split" />
          <div className="actions" style={{ marginTop: 10 }}>
            <input className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="By when? e.g. Friday" style={{ maxWidth: 200 }} />
            <label className="hint" style={{ display: "flex", alignItems: "center", gap: 8 }}>Clarity {clarity}
              <input type="range" min={0} max={100} value={clarity} onChange={(e) => setClarity(+e.target.value)} style={{ accentColor: "var(--text)" }} />
            </label>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" disabled={busy} onClick={doClose}>{busy ? "Closing…" : "Close session"}</button>
            <button className="btn btn-ghost" onClick={() => setPanel(false)}>Back</button>
          </div>
        </div>
      ) : (
        <>
          <div className="fc-input">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your reply…  (Enter to send)" rows={2} />
            <button className="btn btn-primary" disabled={sending || !input.trim()} onClick={send}>{sending ? "…" : "Send"}</button>
          </div>
          <div className="fc-actions"><button className="btn btn-ghost" onClick={() => setPanel(true)}>End &amp; commit →</button></div>
        </>
      )}
    </div>
  );
}
