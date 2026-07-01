"use client";

import { useEffect, useState } from "react";

type Member = { id: string; name?: string | null; email: string; orgRole?: string | null };
type Inv = { id: string; email: string; createdAt: string };

export default function TeamManager({ selfId }: { selfId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Inv[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/team").then((r) => r.json()).catch(() => ({}));
    setMembers(d.members || []); setInvites(d.invites || []); setIsOwner(!!d.isOwner);
  }
  useEffect(() => { load(); }, []);

  async function invite() {
    if (!email.trim() || busy) return;
    setBusy(true); setMsg("");
    try {
      const d = await fetch("/api/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "invite", email }) }).then((r) => r.json());
      if (d.ok) { setMsg(`Invite sent. Share this link if needed: ${d.url}`); setEmail(""); load(); }
      else setMsg(d.message || "Could not invite.");
    } finally { setBusy(false); }
  }
  async function act(action: string, id: string) { await fetch("/api/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id }) }); load(); }

  return (
    <>
      <div className="card">
        <p className="section-title" style={{ margin: "0 0 12px" }}>Invite a teammate</p>
        <div className="actions">
          <input className="input" type="email" placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
          <button className="btn btn-primary" onClick={invite} disabled={busy}>{busy ? "Inviting…" : "Send invite"}</button>
        </div>
        {msg && <p className="hint" style={{ marginTop: 10, wordBreak: "break-all" }}>{msg}</p>}
        <p className="hint" style={{ marginTop: 10 }}>Teammates share the Candidates directory, Alerts, Dashboard and Insights. Each person&apos;s own work stays attributed to them.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="section-title" style={{ margin: "0 0 6px" }}>Members ({members.length || 1})</p>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {(members.length ? members : [{ id: selfId, name: "You", email: "", orgRole: "owner" }]).map((m) => (
              <tr key={m.id}>
                <td>{m.name || "—"}{m.id === selfId && <span className="muted" style={{ fontSize: 12 }}> · you</span>}</td>
                <td className="muted">{m.email}</td>
                <td><span className="badge gray">{m.orgRole || "member"}</span></td>
                <td style={{ textAlign: "right" }}>{isOwner && m.id !== selfId && <button className="btn btn-ghost" onClick={() => act("remove_member", m.id)}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invites.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="section-title" style={{ margin: "0 0 6px" }}>Pending invites</p>
          <table className="table"><tbody>
            {invites.map((iv) => (
              <tr key={iv.id}><td>{iv.email}</td><td className="muted">{new Date(iv.createdAt).toLocaleDateString()}</td><td style={{ textAlign: "right" }}><button className="btn btn-ghost" onClick={() => act("revoke_invite", iv.id)}>Revoke</button></td></tr>
            ))}
          </tbody></table>
        </div>
      )}
    </>
  );
}
