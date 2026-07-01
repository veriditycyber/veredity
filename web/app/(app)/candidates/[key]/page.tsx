import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCandidate } from "@/lib/candidates";
import Topbar from "@/components/Topbar";
import { BandBadge } from "@/components/Badge";
import { Scan, Shield, Sparkle, Camera, Send, Target } from "@/components/icons";

export const dynamic = "force-dynamic";

function Section({ icon, title, children, empty }: { icon: React.ReactNode; title: string; children: React.ReactNode; empty?: boolean }) {
  if (empty) return null;
  return (
    <div className="card">
      <p className="section-title" style={{ margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>{icon} {title}</p>
      {children}
    </div>
  );
}

export default async function CandidateProfile({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const user = (await getCurrentUser())!;
  const name = decodeURIComponent(key);
  const data = await getCandidate(user.id, name);
  if (!data) notFound();
  const { summary, checks, trust, interviews, bots, links, monitors } = data;

  return (
    <>
      <Topbar title="Candidate" crumb="Profile" />
      <div className="content row-gap" style={{ maxWidth: 900 }}>
        <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>{summary.name}</h2>
            <p>{[summary.email, summary.phone].filter(Boolean).join(" · ") || "No contact details on file"}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {summary.worstBand && <BandBadge band={summary.worstBand} status="DONE" />}
            <Link className="btn btn-ghost" href="/candidates">← All candidates</Link>
          </div>
        </div>

        <Section icon={<Shield />} title={`Trust reports (${trust.length})`} empty={trust.length === 0}>
          <table className="table"><thead><tr><th>Score</th><th>Band</th><th>Date</th></tr></thead><tbody>
            {trust.map((t) => <tr key={t.id}><td className="mono">{t.score}</td><td><BandBadge band={t.band} status="DONE" /></td><td className="muted">{new Date(t.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>

        <Section icon={<Scan />} title={`Deepfake checks (${checks.length})`} empty={checks.length === 0}>
          <table className="table"><thead><tr><th>File</th><th>Result</th><th>Score</th><th>Date</th></tr></thead><tbody>
            {checks.map((c) => <tr key={c.id}><td><Link className="row-link" href={`/history/${c.id}`}>{c.fileName}</Link></td><td><BandBadge band={c.band} status={c.status} /></td><td className="mono">{c.score ?? "—"}</td><td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>

        <Section icon={<Sparkle />} title={`Interview analyses (${interviews.length})`} empty={interviews.length === 0}>
          <table className="table"><thead><tr><th>Role</th><th>Recommendation</th><th>Fit</th><th>Date</th></tr></thead><tbody>
            {interviews.map((iv) => <tr key={iv.id}><td><Link className="row-link" href={`/interviews/${iv.id}`}>{iv.role || "—"}</Link></td><td>{iv.recommendation || "—"}</td><td className="mono">{iv.fitScore ?? "—"}</td><td className="muted">{new Date(iv.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>

        <Section icon={<Camera />} title={`Interview bot sessions (${bots.length})`} empty={bots.length === 0}>
          <table className="table"><thead><tr><th>Role</th><th>Status</th><th>Integrity</th><th>Date</th></tr></thead><tbody>
            {bots.map((b) => <tr key={b.id}><td><Link className="row-link" href={`/bot/${b.id}`}>{b.role || "Session"}</Link></td><td className="muted">{b.status}</td><td className="mono">{b.integrityScore ?? "—"}</td><td className="muted">{new Date(b.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>

        <Section icon={<Target />} title={`Monitoring (${monitors.length})`} empty={monitors.length === 0}>
          <table className="table"><thead><tr><th>Interval</th><th>Last band</th><th>Next due</th></tr></thead><tbody>
            {monitors.map((m) => <tr key={m.id}><td className="muted">{m.intervalDays}d</td><td>{m.lastBand ? <BandBadge band={m.lastBand} status="DONE" /> : <span className="muted">—</span>}</td><td className="muted">{new Date(m.nextDueAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>

        <Section icon={<Send />} title={`Verification links (${links.length})`} empty={links.length === 0}>
          <table className="table"><thead><tr><th>Type</th><th>Status</th><th>Date</th></tr></thead><tbody>
            {links.map((l) => <tr key={l.id}><td><span className="badge gray">{l.mode === "id" ? "ID + liveness" : "Deepfake"}</span></td><td>{l.status === "done" ? <span className="badge green">Completed</span> : <span className="badge gray">Pending</span>}</td><td className="muted">{new Date(l.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table>
        </Section>
      </div>
    </>
  );
}
