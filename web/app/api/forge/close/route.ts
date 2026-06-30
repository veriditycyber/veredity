import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInsight, classifyPattern } from "@/lib/forge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sessionId, commitmentText, deadline, clarityScore } = await req.json().catch(() => ({}));
  const session = await prisma.forgeSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const msgs = session.messages.map((m) => ({ role: m.role, content: m.content }));
  const [insight, cls] = await Promise.all([
    generateInsight(msgs).catch(() => ""),
    classifyPattern(msgs).catch(() => null),
  ]);

  await prisma.forgeSession.update({
    where: { id: sessionId },
    data: {
      status: "completed", closedAt: new Date(), insight,
      pattern: cls?.pattern || null, rationale: cls?.rationale || null,
      clarityScore: typeof clarityScore === "number" ? Math.max(0, Math.min(100, Math.round(clarityScore))) : null,
    },
  });

  const ct = (commitmentText || "").toString().trim();
  if (ct) {
    await prisma.forgeCommitment.create({ data: { userId: user.id, sessionId, text: ct.slice(0, 2000), deadline: (deadline || "").toString().slice(0, 40) || null, status: "pending" } });
  }

  if (cls) {
    const same = user.forgePattern === cls.pattern;
    const base = same ? user.forgeConfidence : Math.max(35, user.forgeConfidence - 10);
    const newConf = Math.min(100, base + Math.round(cls.confidence / 12) + 6);
    await prisma.user.update({ where: { id: user.id }, data: { forgePattern: cls.pattern, forgeConfidence: newConf } });
  }

  return NextResponse.json({ ok: true, insight, pattern: cls?.pattern || null });
}
