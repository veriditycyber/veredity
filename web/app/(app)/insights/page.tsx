import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import { RiskDonut, ActivityChart } from "@/components/Charts";
import { Shield, Alert, Scan, Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const user = (await getCurrentUser())!;
  const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - 13);

  const [checks, trust] = await Promise.all([
    prisma.check.findMany({ where: { userId: user.id }, select: { band: true, createdAt: true }, take: 3000 }),
    prisma.trustReport.findMany({ where: { userId: user.id }, select: { band: true, score: true, signals: true, createdAt: true }, take: 3000 }),
  ]);

  // Combined band distribution
  const bands = { green: 0, yellow: 0, red: 0 };
  const bump = (b?: string | null) => { if (b === "green" || b === "yellow" || b === "red") bands[b]++; };
  checks.forEach((c) => bump(c.band)); trust.forEach((t) => bump(t.band));

  // Avg trust score + fraud caught
  const scores = trust.map((t) => t.score).filter((n): n is number => typeof n === "number");
  const avgTrust = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const fraudCaught = bands.red;
  const totalSignals = checks.length + trust.length;

  // Top firing risk signals (from trust reports)
  const sigCount = new Map<string, { label: string; risk: number; warn: number }>();
  for (const t of trust) {
    let arr: any[] = [];
    try { arr = JSON.parse(t.signals || "[]"); } catch {}
    for (const s of arr) {
      if (s.status === "ok") continue;
      const e = sigCount.get(s.key) || { label: s.label || s.key, risk: 0, warn: 0 };
      if (s.status === "risk") e.risk++; else if (s.status === "warn") e.warn++;
      sigCount.set(s.key, e);
    }
  }
  const topSignals = Array.from(sigCount.values()).map((s) => ({ ...s, total: s.risk + s.warn })).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxSig = Math.max(1, ...topSignals.map((s) => s.total));

  // 8-week red-flag rate trend
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() - (7 - i) * 7 + 7);
    const start = new Date(end); start.setDate(end.getDate() - 7);
    return { start, end, total: 0, red: 0, label: `${end.getMonth() + 1}/${end.getDate()}` };
  });
  const both = [...checks.map((c) => ({ band: c.band, createdAt: c.createdAt })), ...trust.map((t) => ({ band: t.band, createdAt: t.createdAt }))];
  for (const r of both) {
    const w = weeks.find((x) => r.createdAt >= x.start && r.createdAt < x.end);
    if (w) { w.total++; if (r.band === "red") w.red++; }
  }

  // 14-day activity
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(since); d.setDate(since.getDate() + i); return { t: d.getTime(), label: `${d.getDate()}`, count: 0, flagged: 0 }; });
  for (const r of both) { const d = new Date(r.createdAt); d.setHours(0, 0, 0, 0); const b = days.find((x) => x.t === d.getTime()); if (b) { b.count++; if (r.band === "red") b.flagged++; } }

  return (
    <>
      <Topbar title="Insights" crumb="Analytics" />
      <div className="content" style={{ maxWidth: 1100 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Where fraud is showing up</h2>
          <p>Patterns across every check and trust score you&apos;ve run — so you can see what&apos;s driving risk in your pipeline.</p>
        </div>

        <div className="grid-stats">
          <div className="stat"><div className="l"><Inbox /> Total signals</div><div className="n">{totalSignals}</div><div className="s">Checks + trust scores</div></div>
          <div className="stat red"><div className="l"><Alert /> Fraud caught</div><div className="n">{fraudCaught}</div><div className="s">High-risk results flagged</div></div>
          <div className="stat"><div className="l"><Shield /> Avg trust score</div><div className="n">{avgTrust ?? "—"}</div><div className="s">Across all candidates</div></div>
          <div className="stat"><div className="l"><Scan /> Flag rate</div><div className="n">{totalSignals ? Math.round((fraudCaught / totalSignals) * 100) : 0}%</div><div className="s">Share flagged high-risk</div></div>
        </div>

        <div className="dash-2col">
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>Top risk signals</p>
            {topSignals.length === 0 ? (
              <div className="empty"><Shield /><div>No signals yet. Run some trust scores.</div></div>
            ) : (
              <div className="sig-bars">
                {topSignals.map((s) => (
                  <div key={s.label} className="sig-bar-row">
                    <div className="sig-bar-label">{s.label}</div>
                    <div className="sig-bar-track"><span style={{ width: `${(s.total / maxSig) * 100}%` }} /></div>
                    <div className="sig-bar-n">{s.total}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="hint" style={{ marginTop: 12 }}>Which checks fire most often across your candidates.</p>
          </div>
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>Risk breakdown</p>
            <RiskDonut green={bands.green} yellow={bands.yellow} red={bands.red} />
          </div>
        </div>

        <div className="dash-2col" style={{ marginTop: 16 }}>
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>Activity · last 14 days</p>
            <ActivityChart data={days.map(({ label, count, flagged }) => ({ label, count, flagged }))} />
          </div>
          <div className="card">
            <p className="section-title" style={{ margin: "0 0 12px" }}>High-risk rate · 8 weeks</p>
            <div className="week-bars">
              {weeks.map((w, i) => {
                const rate = w.total ? Math.round((w.red / w.total) * 100) : 0;
                return (
                  <div key={i} className="week-bar" title={`${w.red}/${w.total} high-risk`}>
                    <div className="wb-track"><span style={{ height: `${rate}%` }} /></div>
                    <div className="wb-label">{w.label}</div>
                  </div>
                );
              })}
            </div>
            <p className="hint" style={{ marginTop: 10 }}>Share of results flagged high-risk each week.</p>
          </div>
        </div>
      </div>
    </>
  );
}
