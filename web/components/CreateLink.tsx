"use client";

import { useState } from "react";
import { Send } from "./icons";

export default function CreateLink() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"basic" | "id">("basic");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const r = await fetch("/api/links", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateName: name, mode }) });
      const d = await r.json();
      if (d.token) setUrl(`${location.origin}/v/${d.token}`);
    } finally { setBusy(false); }
  }
  function copy() { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div className="card">
      <p className="section-title" style={{ margin: "0 0 14px" }}>Create a verification link</p>
      {!url ? (
        <>
          <div className="seg" style={{ marginBottom: 14 }}>
            <button className={mode === "basic" ? "on" : ""} onClick={() => setMode("basic")}>Deepfake check</button>
            <button className={mode === "id" ? "on" : ""} onClick={() => setMode("id")}>ID + liveness</button>
          </div>
          <p className="hint" style={{ marginBottom: 14 }}>
            {mode === "basic"
              ? "Candidate submits a selfie; we run a deepfake check."
              : "Candidate does a live liveness check, submits a selfie and a government ID — we run a deepfake check and a face match."}
          </p>
          <div className="actions" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="hint" style={{ display: "block", marginBottom: 6 }}>Candidate name (optional)</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" />
            </div>
            <button className="btn btn-primary" disabled={busy} onClick={create}><Send /> {busy ? "Creating…" : "Generate link"}</button>
          </div>
        </>
      ) : (
        <div>
          <p className="hint" style={{ marginBottom: 10 }}>Send this link to the candidate. Their scan lands in your History automatically once they complete it.</p>
          <div className="actions">
            <input className="input mono" readOnly value={url} style={{ flex: 1, minWidth: 240 }} onFocus={(e) => e.target.select()} />
            <button className="btn btn-primary" onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</button>
            <button className="btn btn-ghost" onClick={() => { setUrl(""); setName(""); }}>New link</button>
          </div>
        </div>
      )}
    </div>
  );
}
