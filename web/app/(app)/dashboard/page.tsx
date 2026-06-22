import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthlyCheckCount } from "@/lib/usage";
import { MAX_MONTHLY_SCANS } from "@/lib/rd";
import Topbar from "@/components/Topbar";
import { BandBadge } from "@/components/Badge";
import { Scan, Shield, Alert, Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = (await getCurrentUser())!;
  const [total, red, yellow, monthUsed, recent] = await Promise.all([
    prisma.check.count({ where: { userId: user.id } }),
    prisma.check.count({ where: { userId: user.id, band: "red" } }),
    prisma.check.count({ where: { userId: user.id, band: "yellow" } }),
    monthlyCheckCount(),
    prisma.check.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const scansLeft = Math.max(0, MAX_MONTHLY_SCANS - monthUsed);

  return (
    <>
      <Topbar title="Dashboard" crumb="Overview"
        right={<span className="pill"><span className="dot-live" /> <b>{scansLeft}</b>&nbsp;scans left</span>} />
      <div className="content">
        <div className="flex-between" style={{ marginBottom: 18 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}</h2>
            <p>Your candidate verification overview.</p>
          </div>
          <Link className="btn btn-primary" href="/check"><Scan /> New check</Link>
        </div>

        <div className="grid-stats">
          <div className="stat brand">
            <div className="l"><Inbox /> Total checks</div>
            <div className="n">{total}</div>
            <div className="s">All-time candidate scans</div>
          </div>
          <div className="stat red">
            <div className="l"><Alert /> High risk</div>
            <div className="n">{red}</div>
            <div className="s">Flagged likely deepfake</div>
          </div>
          <div className="stat">
            <div className="l"><Shield /> Needs review</div>
            <div className="n">{yellow}</div>
            <div className="s">Inconclusive verdicts</div>
          </div>
          <div className="stat green">
            <div className="l"><Scan /> Scans left</div>
            <div className="n">{scansLeft}</div>
            <div className="s">This month · resets monthly</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <p className="section-title" style={{ margin: 0 }}>Recent checks</p>
            <Link className="hint" href="/history" style={{ color: "var(--brand)" }}>View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty">
              <Inbox /><div>No checks yet. Run your first candidate verification.</div>
              <Link className="btn btn-primary" href="/check" style={{ marginTop: 16 }}><Scan /> New check</Link>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate / file</th><th>Result</th><th>Risk</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td><Link className="row-link" href={`/history/${c.id}`}>{c.candidateName || c.fileName}</Link></td>
                    <td><BandBadge band={c.band} status={c.status} /></td>
                    <td className="mono">{c.score ?? "—"}</td>
                    <td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
