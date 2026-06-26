"use client";

import { useState } from "react";
import { LogoMark } from "./Logo";
import { Chevron, Check, Lock } from "./icons";

export default function ProductHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ph">
      <button className="ph-btn" onClick={() => setOpen((o) => !o)}>
        <LogoMark size={30} />
        <span className="ph-text"><b>TrueHire</b><small>by Veridity</small></span>
        <Chevron className="ph-chev" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="ph-menu" onMouseLeave={() => setOpen(false)}>
          <div className="ph-menu-h">Veridity products</div>
          <div className="ph-item active"><span className="ph-ic"><Check /></span><span><b>TrueHire</b><small>Hiring trust &amp; interview AI</small></span></div>
          <div className="ph-item dim"><span className="ph-ic"><Lock /></span><span><b>VoiceShield</b><small>Call-center deepfake defense · soon</small></span></div>
          <div className="ph-item dim"><span className="ph-ic"><Lock /></span><span><b>AgentGuard</b><small>AI-agent security · soon</small></span></div>
        </div>
      )}
    </div>
  );
}
