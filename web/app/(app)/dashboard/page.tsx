import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthlyCheckCount } from "@/lib/usage";
import { effectiveScanLimit } from "@/lib/plans";
import { networkSize } from "@/lib/fraudnet";
import { teamUserIds } from "@/lib/team";
import { anyProviderConfigured } from "@/lib/ai";
import Topbar from "@/components/Topbar";
import { BandBadge } from "@/components/Badge";
import { ActivityChart, RiskDonut } from "@/components/Charts";
import Onboarding, { type Step } from "@/components/Onboarding";
import { Scan, Shield, Alert, Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = (await getCurrentUser())!;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);

  const ids = await teamUserIds(user);
  const scope = { userId: { in: ids } };
  const [total, green, yellow, red, monthUsed, recent, last14, netSize] = await Promise.all([
    prisma.check.count({ where: scope }),
    prisma.check.count({ where: { ...scope, band: "green" } }),
    prisma.check.count({ where: { ...scope, band: "yellow" } }),
    prisma.check.count({ where: { ...scope, band: "red" } }),
    monthlyCheckCount(),
    prisma.check.findMany({ where: scope, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.check.findMany({ where: { ...scope, createdAt: { gte: since } }, select: { createdAt: true, band: true } }),
    networkSize(),
  ]);

  const [trustCount, memberCount] = await Promise.all([
    prisma.trustReport.count({ where: scope }),
    user.orgId ? prisma.user.count({ where: { orgId: user.orgId } }) : Promise.resolve(1),
  ]);
  const steps: Step[] = [
    { key: "check", label: "Run your first deepfake check", done: total > 0, href: "/check", cta: "New check" },
    { key: "trust", label: "Score a candidate's trust", done: trustCount > 0, href: "/trust", cta: "Trust Score" },
    { key: "ai", label: "Connect an AI provider for interviews & the bot", done: anyProviderConfigured(), href: "/settings", cta: "Settings" },
    { key: "alerts", label: "Turn on high-risk alerts (email or Slack)", done: !!user.emailVerified || !!user.slackWebhook, href: "/settings", cta: "Set up" },
    { key: "team", label: "Invite a teammate", done: memberCount > 1, href: "/team", cta: "Invite" },
  ];
  const scansLeft = Math.max(0, effectiveScanLimit(user.plan) - monthUsed);

  // 14-day activity buckets
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { t: d.getTime(), label: d.toLocaleDateString(undefined, { day: "numeric" }), count: 0, flagged: 0 };
  });
  for (const c of last14) {
    const d = new Date(c.createdAt); d.setHours(0, 0, 0, 0);
    const b = days.find((x) => x.t === d.getTime());
    if (b) { b.count++; if (c.band === "red") b.flagged++; }
  }

  return (
    <>
      <Topbar title="Dashboard" crumb="Overview"
        right={<span className="pill"><span className="dot-live" /> <b>{scansLeft}</b>&nbsp;scans left</span>} />
      <div className="content">
        <Onboarding steps={steps} />
        <div className="flex-between" style={{ marginBottom: 18 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}</h2>
            <p>Your candidate verification overview.</p>
          </div>
          <Link className="btn btn-primary" href="/check"><Scan /> New check</Link>
        </div>

        <div className="grid-stats">
          <div className="stat"><div className="l"><Inbox /> Total checks</div><div className="n">{total}</div><div className="s">All-time candidate scans</div></div>
          <div className="stat red"><div className="l"><Alert /> High risk</div><div className="n">{red}</div><div className="s">Flagged likely deepfake</div></div>
          <div className="stat"><div className="l"><Shield /> Needs review</div><div className="n">{yellow}</div><div className="s">Inconclusive verdicts</div></div>
          <div className="stat"><div className="l"><Scan /> Scans left</div><div className="n">{scansLeft}</div><div className="s">This month · resets monthly</div></div>
          <div className="stat"><div className="l"><Shield /> Fraud network</div><div className="n">{netSize.toLocaleString()}</div><div className="s">Signals shared across TrueHire</div></div>
        </div>

        <div className="dash-2col">
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>Activity · last 14 days</p>
            <ActivityChart data={days.map(({ label, count, flagged }) => ({ label, count, flagged }))} />
            <p className="hint" style={{ marginTop: 10 }}>Bars show checks per day · <span style={{ color: "var(--danger)" }}>red</span> = high-risk flags.</p>
          </div>
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>Risk breakdown</p>
            <RiskDonut green={green} yellow={yellow} red={red} />
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <p className="section-title" style={{ margin: 0 }}>Recent checks</p>
            <Link className="hint" href="/history" style={{ color: "var(--text)" }}>View all →</Link>
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
