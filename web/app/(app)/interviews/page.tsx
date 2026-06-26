import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import InterviewAssistant from "@/components/InterviewAssistant";
import { Sparkle } from "@/components/icons";

export const dynamic = "force-dynamic";
const KEY = process.env.ANTHROPIC_API_KEY;

export default async function InterviewsPage() {
  const user = (await getCurrentUser())!;
  const list = await prisma.interview.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <>
      <Topbar title="Interview AI" crumb="Decision support" right={<span className="pill"><Sparkle /> Powered by Claude</span>} />
      <div className="content row-gap">
        <div className="page-head" style={{ margin: 0 }}>
          <h2>AI interview assistant</h2>
          <p>Paste an interview transcript or your notes. TrueHire scores the candidate, flags strengths and risks, and suggests follow-up questions — so you decide faster, with evidence.</p>
        </div>

        {!KEY && (
          <div className="card" style={{ borderColor: "var(--danger)" }}>
            <b>AI not configured.</b>{" "}
            <span className="muted">Add an <span className="mono">ANTHROPIC_API_KEY</span> environment variable to enable interview analysis.</span>
          </div>
        )}

        <InterviewAssistant />

        <div className="card">
          <p className="section-title" style={{ margin: "0 0 6px" }}>Past analyses</p>
          {list.length === 0 ? (
            <div className="empty"><Sparkle /><div>No analyses yet. Paste a transcript above.</div></div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate</th><th>Role</th><th>Recommendation</th><th>Fit</th><th>Date</th></tr></thead>
              <tbody>
                {list.map((iv) => {
                  const band = iv.recommendation === "Strong Yes" || iv.recommendation === "Yes" ? "green" : iv.recommendation === "No" ? "red" : "yellow";
                  return (
                    <tr key={iv.id}>
                      <td><Link className="row-link" href={`/interviews/${iv.id}`}>{iv.candidateName || "Untitled"}</Link></td>
                      <td className="muted">{iv.role || "—"}</td>
                      <td><span className={`badge ${band}`}>{iv.recommendation || "—"}</span></td>
                      <td className="mono">{iv.fitScore ?? "—"}</td>
                      <td className="muted">{new Date(iv.createdAt).toLocaleDateString()}</td>
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
