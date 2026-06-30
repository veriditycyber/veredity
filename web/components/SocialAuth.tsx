"use client";

import { useEffect, useState } from "react";
import { GoogleIcon, AppleIcon } from "./icons";

export default function SocialAuth({ label = "sign in" }: { label?: string }) {
  const [cfg, setCfg] = useState<{ google: boolean; apple: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers").then((r) => r.json()).then(setCfg).catch(() => setCfg({ google: false, apple: false }));
  }, []);

  if (!cfg || (!cfg.google && !cfg.apple)) return null;

  return (
    <>
      <div className="social-auth">
        {cfg.google && (
          <a className="btn btn-block social-btn" href="/api/auth/google"><GoogleIcon /> Continue with Google</a>
        )}
        {cfg.apple && (
          <a className="btn btn-block social-btn" href="/api/auth/apple"><AppleIcon /> Continue with Apple</a>
        )}
      </div>
      <div className="auth-divider"><span>or {label} with email</span></div>
    </>
  );
}
