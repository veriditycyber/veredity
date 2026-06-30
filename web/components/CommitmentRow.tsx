"use client";

import { useState } from "react";

const LABELS: Record<string, string> = { done: "Done", in_progress: "In progress", not_done: "Didn't" };

export default function CommitmentRow({ id, text, deadline, status }: { id: string; text: string; deadline: string | null; status: string }) {
  const [cur, setCur] = useState(status);
  const [busy, setBusy] = useState(false);

  async function set(next: string) {
    if (busy || next === cur) return;
    const prev = cur; setCur(next); setBusy(true);
    try {
      const r = await fetch("/api/forge/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ commitmentId: id, status: next }) });
      if (!r.ok) setCur(prev);
    } catch { setCur(prev); } finally { setBusy(false); }
  }

  return (
    <div className={`commit-row${cur === "not_done" ? " missed" : ""}${cur === "done" ? " kept" : ""}`}>
      <div className="commit-body">
        <div className="commit-text">{text}</div>
        {deadline && <div className="commit-when">by {deadline}</div>}
      </div>
      <div className="commit-actions">
        {(["done", "in_progress", "not_done"] as const).map((s) => (
          <button key={s} className={`chip-btn${cur === s ? " on" : ""}`} disabled={busy} onClick={() => set(s)}>{LABELS[s]}</button>
        ))}
      </div>
    </div>
  );
}
