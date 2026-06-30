"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Check, Alert } from "@/components/icons";

export default function VerifyEmailPage() {
  const [state, setState] = useState<"working" | "ok" | "fail">("working");
  const [msg, setMsg] = useState("Confirming your email…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) { setState("fail"); setMsg("Missing verification token."); return; }
    fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => r.json())
      .then((d) => { if (d.ok) { setState("ok"); setMsg("Your email is verified."); } else { setState("fail"); setMsg(d.message || "Verification failed."); } })
      .catch(() => { setState("fail"); setMsg("Something went wrong. Try again."); });
  }, []);

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <Logo sub="Veridity" />
        <div className={`verify-mark ${state}`}>{state === "ok" ? <Check /> : state === "fail" ? <Alert /> : <span className="spinner" style={{ margin: 0 }} />}</div>
        <div className="auth-title" style={{ marginTop: 8 }}>{state === "ok" ? "Email verified" : state === "fail" ? "Couldn't verify" : "One moment"}</div>
        <div className="auth-sub">{msg}</div>
        <Link className="btn btn-primary btn-block" href={state === "ok" ? "/dashboard" : "/login"}>{state === "ok" ? "Go to dashboard" : "Back to sign in"}</Link>
      </div>
    </div>
  );
}
