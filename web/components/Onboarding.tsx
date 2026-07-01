"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "./icons";

export type Step = { key: string; label: string; done: boolean; href: string; cta: string };

export default function Onboarding({ steps }: { steps: Step[] }) {
  const done = steps.filter((s) => s.done).length;
  const allDone = done === steps.length;
  const [dismissed, setDismissed] = useState(() => {
    try { return allDone || localStorage.getItem("veridity_onboarding_done") === "1"; } catch { return allDone; }
  });
  if (dismissed) return null;

  function dismiss() { try { localStorage.setItem("veridity_onboarding_done", "1"); } catch {} setDismissed(true); }

  const next = steps.find((s) => !s.done);
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="card onboarding" style={{ marginBottom: 16 }}>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <div>
          <p className="section-title" style={{ margin: "0 0 4px" }}>Getting started</p>
          <p className="hint" style={{ margin: 0 }}>{done} of {steps.length} done — set TrueHire up in a couple of minutes.</p>
        </div>
        <button className="btn btn-ghost" onClick={dismiss}>Dismiss</button>
      </div>
      <div className="ob-progress"><span style={{ width: `${pct}%` }} /></div>
      <div className="ob-steps">
        {steps.map((s) => (
          <div key={s.key} className={`ob-step${s.done ? " done" : ""}`}>
            <span className="ob-tick">{s.done ? <Check /> : <span className="ob-dot" />}</span>
            <span className="ob-label">{s.label}</span>
            {!s.done && s.key === next?.key && <Link className="btn btn-primary ob-cta" href={s.href}>{s.cta}</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}
