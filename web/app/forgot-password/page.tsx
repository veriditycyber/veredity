"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/auth/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    } catch {}
    setBusy(false); setSent(true);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Logo sub="Veridity" />
        <div className="auth-title">Reset your password</div>
        {sent ? (
          <>
            <div className="auth-sub">If an account exists for <b>{email}</b>, we&apos;ve sent a reset link. Check your inbox (and spam).</div>
            <Link className="btn btn-primary btn-block" href="/login">Back to sign in</Link>
          </>
        ) : (
          <>
            <div className="auth-sub">Enter your email and we&apos;ll send you a link to set a new password.</div>
            <form onSubmit={submit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? "Sending…" : "Send reset link"}</button>
            </form>
            <div className="auth-foot">Remembered it? <Link href="/login">Sign in</Link></div>
          </>
        )}
      </div>
    </div>
  );
}
