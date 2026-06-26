import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import Scorecard from "@/components/Scorecard";

export const dynamic = "force-dynamic";

const arr = (s: string | null) => { try { return s ? JSON.parse(s) : []; } catch { return []; } };

export default async function InterviewDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const iv = await prisma.interview.findFirst({ where: { id, userId: user.id } });
  if (!iv) notFound();

  const a = {
    summary: iv.summary || "",
    strengths: arr(iv.strengths),
    concerns: arr(iv.concerns),
    questions: arr(iv.questions),
    recommendation: iv.recommendation || "",
    fitScore: iv.fitScore,
  };

  return (
    <>
      <Topbar title="Interview Analysis" crumb="Interview AI · Detail" right={<Link className="btn btn-ghost" href="/interviews">← Back</Link>} />
      <div className="content">
        <div className="card">
          <Scorecard a={a} meta={`${iv.candidateName || "Candidate"}${iv.role ? ` · ${iv.role}` : ""} · ${new Date(iv.createdAt).toLocaleString()}`} />
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <p className="section-title" style={{ margin: "0 0 10px" }}>Transcript</p>
          <pre className="transcript">{iv.transcript}</pre>
        </div>
      </div>
    </>
  );
}
