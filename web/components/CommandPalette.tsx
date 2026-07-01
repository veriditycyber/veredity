"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { label: string; href: string; hint?: string; kind: "nav" | "candidate" };

const NAV: { label: string; href: string; keywords?: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Insights", href: "/insights", keywords: "analytics trends" },
  { label: "Candidates", href: "/candidates", keywords: "people" },
  { label: "New Check", href: "/check", keywords: "deepfake upload" },
  { label: "Trust Score", href: "/trust", keywords: "score fraud" },
  { label: "Bulk screening", href: "/trust/bulk", keywords: "batch csv" },
  { label: "Interview Bot", href: "/bot", keywords: "meeting zoom notetaker" },
  { label: "Interview AI", href: "/interviews", keywords: "scorecard" },
  { label: "Verify Links", href: "/links", keywords: "candidate self liveness id" },
  { label: "Monitoring", href: "/monitor", keywords: "continuous re-verify" },
  { label: "Alerts", href: "/alerts", keywords: "notifications" },
  { label: "Developers", href: "/developers", keywords: "api keys webhooks" },
  { label: "Team", href: "/team", keywords: "invite members" },
  { label: "Billing", href: "/billing", keywords: "plan subscription" },
  { label: "Settings", href: "/settings", keywords: "account" },
  { label: "Forge coach", href: "/forge", keywords: "founder decision" },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cands, setCands] = useState<{ key: string; name: string; email: string | null }[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    }
    function onToggle() { setOpen((o) => !o); }
    document.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:toggle", onToggle);
    return () => { document.removeEventListener("keydown", onKey); window.removeEventListener("cmdk:toggle", onToggle); };
  }, []);

  useEffect(() => { if (open) { setQ(""); setCands([]); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) { setCands([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => setCands(d.candidates || [])).catch(() => {});
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  const items: Item[] = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const nav = NAV.filter((n) => !ql || n.label.toLowerCase().includes(ql) || (n.keywords || "").includes(ql))
      .map((n) => ({ label: n.label, href: n.href, kind: "nav" as const }));
    const cItems: Item[] = cands.map((c) => ({ label: c.name, href: `/candidates/${c.key}`, hint: c.email || undefined, kind: "candidate" as const }));
    return [...nav, ...cItems];
  }, [q, cands]);

  useEffect(() => { if (active >= items.length) setActive(0); }, [items, active]);

  function go(href: string) { setOpen(false); router.push(href); }

  if (!open) return null;

  return (
    <div className="cmdk-overlay noprint" onClick={() => setOpen(false)}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <input ref={inputRef} className="cmdk-input" value={q} placeholder="Search candidates or jump to…"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && items[active]) { e.preventDefault(); go(items[active].href); }
          }} />
        <div className="cmdk-list">
          {items.length === 0 ? <div className="cmdk-empty">No matches.</div> : items.map((it, i) => (
            <button key={it.href + i} className={`cmdk-item${i === active ? " on" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => go(it.href)}>
              <span className="cmdk-kind">{it.kind === "candidate" ? "Candidate" : "Go to"}</span>
              <span className="cmdk-label">{it.label}</span>
              {it.hint && <span className="cmdk-hint">{it.hint}</span>}
            </button>
          ))}
        </div>
        <div className="cmdk-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
      </div>
    </div>
  );
}
