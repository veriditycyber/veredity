import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import HistoryTable from "@/components/HistoryTable";
import { Scan, Clock } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = (await getCurrentUser())!;
  const checks = await prisma.check.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 500 });
  const rows = checks.map((c) => ({
    id: c.id, candidateName: c.candidateName, fileName: c.fileName,
    band: c.band, score: c.score, status: c.status, engine: c.engine, createdAt: c.createdAt.toISOString(),
  }));

  return (
    <>
      <Topbar title="History" crumb="Audit trail"
        right={<>
          <a className="btn btn-ghost" href="/api/export">Export CSV</a>
          <Link className="btn btn-primary" href="/check"><Scan /> New check</Link>
        </>} />
      <div className="content">
        <div className="page-head">
          <h2>Verification history</h2>
          <p>Every check, retained as a compliance-grade audit trail. Search, filter, or export it.</p>
        </div>
        {rows.length === 0 ? (
          <div className="card">
            <div className="empty"><Clock /><div>No checks yet.</div>
              <Link className="btn btn-primary" href="/check" style={{ marginTop: 16 }}><Scan /> Run your first check</Link>
            </div>
          </div>
        ) : (
          <HistoryTable rows={rows} />
        )}
      </div>
    </>
  );
}
