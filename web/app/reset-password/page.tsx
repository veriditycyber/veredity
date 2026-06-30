"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (pw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
      const d = await r.json();
      if (r.ok && d.ok) { router.push("/dashboard"); router.refresh(); }
      else { setErr(d.message || "Reset failed."); setBusy(false); }
    } catch { setErr("Network error."); setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Logo sub="Veridity" />
        <div className="auth-title">Set a new password</div>
        <div className="auth-sub">Choose a strong password for your account.</div>
        <form onSubmit={submit}>
          <div className="field">
            <label>New password</label>
            <input className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="err">{err}</div>
          <button className="btn btn-primary btn-block" disabled={busy || !token} type="submit">{busy ? "Saving…" : "Save password"}</button>
        </form>
        {!token && <div className="auth-foot">No reset token found. <Link href="/forgot-password">Request a new link</Link></div>}
      </div>
    </div>
  );
}
