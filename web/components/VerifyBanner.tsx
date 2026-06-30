"use client";

import { useState } from "react";
import { Alert, Check } from "./icons";

export default function VerifyBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  async function resend() {
    setState("sending"); setMsg("");
    try {
      const r = await fetch("/api/auth/resend-verification", { method: "POST" });
      const d = await r.json();
      if (d.ok) { setState("sent"); }
      else { setState("error"); setMsg(d.message || "Couldn't send."); }
    } catch { setState("error"); setMsg("Network error."); }
  }

  return (
    <div className="verify-banner noprint">
      <span className="vb-ic"><Alert /></span>
      <span className="vb-text">Verify <b>{email}</b> to secure your account.</span>
      {state === "sent" ? (
        <span className="vb-done"><Check /> Sent — check your inbox</span>
      ) : (
        <button className="vb-btn" onClick={resend} disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Resend email"}</button>
      )}
      {msg && <span className="vb-err">{msg}</span>}
      <button className="vb-x" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
    </div>
  );
}
