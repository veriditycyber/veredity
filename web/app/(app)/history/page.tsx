import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import { BandBadge } from "@/components/Badge";
import { Scan, Clock } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = (await getCurrentUser())!;
  const checks = await prisma.check.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <Topbar title="History" crumb="Audit trail"
        right={<Link className="btn btn-primary" href="/check"><Scan /> New check</Link>} />
      <div className="content">
        <div className="page-head">
          <h2>Verification history</h2>
          <p>Every check, retained as a compliance-grade audit trail. Click any row for the full report.</p>
        </div>
        <div className="card">
          {checks.length === 0 ? (
            <div className="empty"><Clock /><div>No checks yet.</div>
              <Link className="btn btn-primary" href="/check" style={{ marginTop: 16 }}><Scan /> Run your first check</Link>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate / file</th><th>Result</th><th>Risk</th><th>Engine</th><th>Date</th></tr></thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.id}>
                    <td><Link className="row-link" href={`/history/${c.id}`}>{c.candidateName || c.fileName}</Link></td>
                    <td><BandBadge band={c.band} status={c.status} /></td>
                    <td className="mono">{c.score ?? "—"}</td>
                    <td className="muted mono" style={{ fontSize: 12 }}>{c.engine || "—"}</td>
                    <td className="muted">{new Date(c.createdAt).toLocaleString()}</td>
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
