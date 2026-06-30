"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Check } from "@/components/icons";
import { Logo } from "@/components/Logo";
import SocialAuth from "@/components/SocialAuth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { router.push("/dashboard"); router.refresh(); }
      else { const d = await r.json().catch(() => ({})); setErr(d.message || "Could not create account."); setBusy(false); }
    } catch { setErr("Network error. Try again."); setBusy(false); }
  }

  return (
    <div className="auth-card">
      <Logo sub="TrueHire" />
      <div className="auth-title">Create your account</div>
      <div className="auth-sub">Start verifying candidates against deepfake & impersonation fraud.</div>
      <SocialAuth label="sign up" />
      <form onSubmit={submit}>
        <div className="field">
          <label>Your name</label>
          <input className="input" value={form.name} onChange={set("name")} placeholder="Jane Doe" />
        </div>
        <div className="field">
          <label>Company</label>
          <input className="input" value={form.company} onChange={set("company")} placeholder="Acme Inc." />
        </div>
        <div className="field">
          <label>Work email</label>
          <input className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required />
        </div>
        <div className="field">
          <label>Password <span className="hint">(8+ characters)</span></label>
          <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
        </div>
        <div className="err">{err}</div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? "Creating…" : "Create account"}</button>
      </form>
      <div className="auth-foot">Already have an account? <Link href="/login">Sign in</Link></div>
      <div className="trust-row">
        <span><Lock /> Encrypted</span>
        <span><Check /> Consent-first</span>
        <span><Shield /> No media stored</span>
      </div>
    </div>
  );
}
