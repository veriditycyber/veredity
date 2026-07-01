"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Alert } from "@/components/icons";

export default function JoinTeamPage() {
  const [state, setState] = useState<"working" | "ok" | "fail">("working");
  const [msg, setMsg] = useState("Joining the team…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) { setState("fail"); setMsg("Missing invite token."); return; }
    fetch("/api/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "accept", token }) })
      .then((r) => r.json())
      .then((d) => { if (d.ok) { setState("ok"); setMsg("You're in — welcome to the team."); } else { setState("fail"); setMsg(d.message || "Could not join."); } })
      .catch(() => { setState("fail"); setMsg("Something went wrong."); });
  }, []);

  return (
    <div className="content" style={{ maxWidth: 520 }}>
      <div className="card" style={{ textAlign: "center", marginTop: 40 }}>
        <div className={`verify-mark ${state}`}>{state === "ok" ? <Check /> : state === "fail" ? <Alert /> : <span className="spinner" style={{ margin: 0 }} />}</div>
        <h2 style={{ marginTop: 8 }}>{state === "ok" ? "Joined" : state === "fail" ? "Couldn't join" : "One moment"}</h2>
        <p className="muted">{msg}</p>
        <Link className="btn btn-primary" href={state === "ok" ? "/team" : "/dashboard"}>{state === "ok" ? "Go to team" : "Back to dashboard"}</Link>
      </div>
    </div>
  );
}
