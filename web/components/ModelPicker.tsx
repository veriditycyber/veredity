"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle, Chevron, Check, Lock } from "./icons";

type M = { id: string; label: string; provider: string; tier: string; blurb: string; available: boolean };
const PROVIDER_LABEL: Record<string, string> = { anthropic: "Claude", openai: "GPT", google: "Gemini" };
const LS_KEY = "veridity_model";

export default function ModelPicker({ value, onChange, compact }: { value?: string; onChange?: (id: string) => void; compact?: boolean }) {
  const [models, setModels] = useState<M[]>([]);
  const [sel, setSel] = useState<string>(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/models").then((r) => r.json()).then((d) => {
      if (!alive) return;
      setModels(d.models || []);
      const saved = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      const avail = (d.models || []).filter((m: M) => m.available).map((m: M) => m.id);
      const initial = (value && avail.includes(value) && value) || (saved && avail.includes(saved) && saved) || d.default;
      setSel(initial);
      onChange?.(initial);
    }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(m: M) {
    if (!m.available) return;
    setSel(m.id); setOpen(false);
    try { localStorage.setItem(LS_KEY, m.id); } catch {}
    onChange?.(m.id);
  }

  const current = models.find((m) => m.id === sel);
  const anyAvailable = models.some((m) => m.available);

  return (
    <div className={`mp${compact ? " compact" : ""}`} ref={ref}>
      <button type="button" className="mp-btn" onClick={() => setOpen((o) => !o)}>
        <Sparkle />
        <span className="mp-label">{current ? current.label : anyAvailable ? "Choose model" : "No AI key set"}</span>
        <Chevron className="mp-chev" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="mp-menu">
          {!anyAvailable && <div className="mp-empty">No AI provider configured. Add a provider key to enable model selection.</div>}
          {models.map((m) => (
            <button key={m.id} type="button" className={`mp-item${m.id === sel ? " on" : ""}${m.available ? "" : " dim"}`} onClick={() => pick(m)} disabled={!m.available}>
              <span className="mp-ic">{m.id === sel ? <Check /> : m.available ? <span className="mp-dot" /> : <Lock />}</span>
              <span className="mp-text"><b>{m.label}</b><small>{PROVIDER_LABEL[m.provider]} · {m.blurb}{m.available ? "" : " · key not set"}</small></span>
              <span className={`mp-tier ${m.tier}`}>{m.tier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
