import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import TrustFlow from "@/components/TrustFlow";
import { BandBadge } from "@/components/Badge";
import { Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const user = (await getCurrentUser())!;
  const recent = await prisma.trustReport.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 });

  return (
    <>
      <Topbar title="Trust Score" crumb="Candidate trust" />
      <div className="content" style={{ maxWidth: 960 }}>
        <div className="flex-between" style={{ marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>Score a candidate&apos;s trust in seconds</h2>
            <p>Beyond the face check: TrueHire fuses email, phone, location consistency, sanctions screening and résumé authenticity into one fraud signal — built to catch impersonators and fake remote workers.</p>
          </div>
          <Link className="btn btn-ghost" href="/trust/bulk">Bulk screen →</Link>
        </div>

        <TrustFlow />

        <div className="card" style={{ marginTop: 16 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <p className="section-title" style={{ margin: 0 }}>Recent trust reports</p>
          </div>
          {recent.length === 0 ? (
            <div className="empty"><Inbox /><div>No trust reports yet. Score your first candidate above.</div></div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate</th><th>Signal</th><th>Score</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.candidateName || r.email || r.phone || "—"}</td>
                    <td><BandBadge band={r.band} status="DONE" /></td>
                    <td className="mono">{r.score}</td>
                    <td className="muted">{new Date(r.createdAt).toLocaleDateString()}</td>
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
