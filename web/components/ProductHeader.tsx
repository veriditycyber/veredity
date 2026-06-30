"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "./Logo";
import { Chevron, Check, Lock } from "./icons";

const ACTIVE = {
  truehire: { name: "TrueHire", sub: "Hiring trust & interview AI" },
  forge: { name: "Forge", sub: "Founder decision coaching" },
} as const;

export default function ProductHeader({ active = "truehire" }: { active?: "truehire" | "forge" }) {
  const [open, setOpen] = useState(false);
  const cur = ACTIVE[active];
  return (
    <div className="ph">
      <button className="ph-btn" onClick={() => setOpen((o) => !o)}>
        <LogoMark size={30} />
        <span className="ph-text"><b>{cur.name}</b><small>by Veridity</small></span>
        <Chevron className="ph-chev" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="ph-menu" onMouseLeave={() => setOpen(false)}>
          <div className="ph-menu-h">Veridity products</div>
          <Link href="/dashboard" className={`ph-item link${active === "truehire" ? " active" : ""}`}>
            <span className="ph-ic">{active === "truehire" ? <Check /> : <span className="ph-dot" />}</span>
            <span><b>TrueHire</b><small>Hiring trust &amp; interview AI</small></span>
          </Link>
          <Link href="/forge" className={`ph-item link${active === "forge" ? " active" : ""}`}>
            <span className="ph-ic">{active === "forge" ? <Check /> : <span className="ph-dot" />}</span>
            <span><b>Forge</b><small>Founder decision coaching</small></span>
          </Link>
          <div className="ph-item dim"><span className="ph-ic"><Lock /></span><span><b>VoiceShield</b><small>Call-center deepfake defense · soon</small></span></div>
          <div className="ph-item dim"><span className="ph-ic"><Lock /></span><span><b>AgentGuard</b><small>AI-agent security · soon</small></span></div>
        </div>
      )}
    </div>
  );
}
