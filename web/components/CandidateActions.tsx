"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CandidateActions({ ckey }: { ckey: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function erase() {
    setBusy(true); setMsg("");
    try {
      const d = await fetch(`/api/candidates/${ckey}`, { method: "DELETE" }).then((r) => r.json());
      if (d.ok) { router.push("/candidates"); router.refresh(); return; }
      setMsg("Could not erase."); setBusy(false);
    } catch { setMsg("Network error."); setBusy(false); }
  }

  return (
    <div className="actions" style={{ margin: 0, gap: 8 }}>
      <a className="btn btn-ghost" href={`/api/candidates/${ckey}?export=1`}>Export data</a>
      {!confirm ? (
        <button className="btn btn-danger" onClick={() => setConfirm(true)}>Erase all data</button>
      ) : (
        <>
          <button className="btn btn-danger" disabled={busy} onClick={erase}>{busy ? "Erasing…" : "Confirm erase"}</button>
          <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
        </>
      )}
      {msg && <span className="hint" style={{ color: "var(--danger)" }}>{msg}</span>}
    </div>
  );
}
