import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import CreateLink from "@/components/CreateLink";
import { BandBadge } from "@/components/Badge";
import { Send } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const user = (await getCurrentUser())!;
  const links = await prisma.verificationLink.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const checkIds = links.map((l) => l.checkId).filter((x): x is string => !!x);
  const checks = checkIds.length ? await prisma.check.findMany({ where: { id: { in: checkIds } } }) : [];
  const checkMap = new Map(checks.map((c) => [c.id, c]));

  return (
    <>
      <Topbar title="Verification Links" crumb="Candidate self-verify" />
      <div className="content row-gap">
        <div className="page-head" style={{ margin: 0 }}>
          <h2>Send candidates a verification link</h2>
          <p>Generate a link, send it to the candidate, and their identity scan lands in your history automatically — no account needed on their side.</p>
        </div>

        <CreateLink />

        <div className="card">
          <p className="section-title" style={{ margin: "0 0 6px" }}>Your links</p>
          {links.length === 0 ? (
            <div className="empty"><Send /><div>No links yet. Generate one above.</div></div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate</th><th>Status</th><th>Result</th><th>Created</th></tr></thead>
              <tbody>
                {links.map((l) => {
                  const c = l.checkId ? checkMap.get(l.checkId) : null;
                  return (
                    <tr key={l.id}>
                      <td>{l.candidateName || "—"}</td>
                      <td>{l.status === "done" ? <span className="badge green">Completed</span> : <span className="badge gray">Pending</span>}</td>
                      <td>{c ? <Link className="row-link" href={`/history/${c.id}`}><BandBadge band={c.band} status={c.status} /></Link> : <span className="muted">—</span>}</td>
                      <td className="muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
