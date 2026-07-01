import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listCandidates } from "@/lib/candidates";
import { teamUserIds } from "@/lib/team";
import Topbar from "@/components/Topbar";
import { BandBadge } from "@/components/Badge";
import { Person } from "@/components/icons";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { check: "Deepfake", trust: "Trust", interview: "Interview", link: "Link", monitor: "Monitor" };

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = (await getCurrentUser())!;
  const { q } = await searchParams;
  const candidates = await listCandidates(await teamUserIds(user), q);

  return (
    <>
      <Topbar title="Candidates" crumb="People" />
      <div className="content" style={{ maxWidth: 1000 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Every candidate, one view</h2>
          <p>All signals about a person — deepfake checks, trust scores, interviews, links and monitoring — pulled together in a single profile.</p>
        </div>

        <form className="card" style={{ marginBottom: 16 }} action="/candidates">
          <div className="actions" style={{ margin: 0 }}>
            <input className="input" name="q" defaultValue={q || ""} placeholder="Search by name or email…" style={{ flex: 1, minWidth: 220 }} />
            <button className="btn btn-primary" type="submit">Search</button>
            {q && <Link className="btn btn-ghost" href="/candidates">Clear</Link>}
          </div>
        </form>

        <div className="card">
          <p className="section-title" style={{ margin: "0 0 6px" }}>{q ? `Results for “${q}”` : "All candidates"} · {candidates.length}</p>
          {candidates.length === 0 ? (
            <div className="empty"><Person /><div>{q ? "No candidates match your search." : "No candidates yet. Run a check, trust score, or interview."}</div></div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate</th><th>Signals</th><th>Worst result</th><th>Records</th><th>Last activity</th></tr></thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.key}>
                    <td>
                      <Link className="row-link" href={`/candidates/${c.key}`}>{c.name}</Link>
                      {c.email && <div className="muted" style={{ fontSize: 12 }}>{c.email}</div>}
                    </td>
                    <td>{c.types.map((t) => <span key={t} className="badge gray" style={{ marginRight: 4 }}>{TYPE_LABEL[t] || t}</span>)}</td>
                    <td>{c.worstBand ? <BandBadge band={c.worstBand} status="DONE" /> : <span className="muted">—</span>}</td>
                    <td className="mono">{c.records}</td>
                    <td className="muted">{c.lastActivity.toLocaleDateString()}</td>
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
