import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import BotConsole from "@/components/BotConsole";

export const dynamic = "force-dynamic";

export default async function BotSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const s = await prisma.interviewSession.findFirst({ where: { id, userId: user.id } });
  if (!s) notFound();

  const initial = {
    id: s.id, status: s.status, platform: s.platform || undefined, candidateName: s.candidateName || undefined, role: s.role || undefined,
    transcript: s.transcript || "", notes: s.notes || undefined,
    report: s.summary ? {
      summary: s.summary, strengths: JSON.parse(s.strengths || "[]"), concerns: JSON.parse(s.concerns || "[]"),
      questions: JSON.parse(s.questions || "[]"), recommendation: s.recommendation, fitScore: s.fitScore, model: s.model,
    } : null,
    integrity: s.integrity ? { ...JSON.parse(s.integrity), integrityScore: s.integrityScore ?? undefined } : null,
  };

  return (
    <>
      <Topbar title="Interview session" crumb="Interview Bot" />
      <div className="content" style={{ maxWidth: 900 }}>
        <div className="flex-between noprint" style={{ marginBottom: 14 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>{[s.candidateName, s.role].filter(Boolean).join(" · ") || "Interview session"}</h2>
            <p>{s.platform && s.platform !== "manual" ? "Live bot session." : "Manual transcript session."}</p>
          </div>
          <Link className="btn btn-ghost" href="/bot">← All sessions</Link>
        </div>
        <BotConsole initial={initial} />
      </div>
    </>
  );
}
