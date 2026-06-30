import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Topbar from "@/components/Topbar";
import ForgeChat from "@/components/ForgeChat";

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  insight: "Insight", accountability: "Accountability", confrontation: "Confrontation", exploration: "Exploration",
};

export default async function ForgeSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const session = await prisma.forgeSession.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) notFound();

  const messages = session.messages.map((m) => ({ id: m.id, role: m.role, content: m.content }));

  return (
    <>
      <Topbar title="Coach" crumb="Forge session"
        right={<span className="pill"><span className={`status-dot ${session.status}`} /> {(session.mode && MODE_LABEL[session.mode]) || "Session"}</span>} />
      <div className="content forge-session">
        <div className="flex-between" style={{ marginBottom: 14 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>{session.decisionContext || "Open session"}</h2>
            <p>{session.status === "active" ? "Reply honestly. The coach is built to call avoidance." : "This session is closed."}</p>
          </div>
          <Link className="btn btn-ghost" href="/forge">← All sessions</Link>
        </div>
        <ForgeChat sessionId={session.id} initial={messages} status={session.status} insight={session.insight} />
      </div>
    </>
  );
}
