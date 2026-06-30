"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";

export default function ModelPreference({ initial }: { initial?: string | null }) {
  const [saved, setSaved] = useState(false);

  async function save(id: string) {
    setSaved(false);
    try {
      const r = await fetch("/api/account/preferences", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: id }) });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 1800); }
    } catch {}
  }

  return (
    <div className="flex-between" style={{ flexWrap: "wrap", gap: 10 }}>
      <span className="muted" style={{ fontSize: 14 }}>Default AI model {saved && <span style={{ color: "var(--text)" }}>· saved</span>}</span>
      <ModelPicker value={initial || undefined} onChange={save} compact />
    </div>
  );
}
