"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Check } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) { router.push("/dashboard"); router.refresh(); }
      else { const d = await r.json().catch(() => ({})); setErr(d.message || "Sign in failed."); setBusy(false); }
    } catch { setErr("Network error. Try again."); setBusy(false); }
  }

  return (
    <div className="auth-card">
      <div className="logo"><span className="mark"><Shield style={{ stroke: "#04111f" }} /></span> <span>TrueHire<small>Hiring Trust Layer</small></span></div>
      <div className="auth-title">Sign in</div>
      <div className="auth-sub">Secure access to your candidate verification console.</div>
      <form onSubmit={submit}>
        <div className="field">
          <label>Work email</label>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <div className="err">{err}</div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <div className="auth-foot">No account yet? <Link href="/signup">Create one</Link></div>
      <div className="trust-row">
        <span><Lock /> Encrypted</span>
        <span><Check /> Consent-first</span>
        <span><Shield /> No media stored</span>
      </div>
    </div>
  );
}
