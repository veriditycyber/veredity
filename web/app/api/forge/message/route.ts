import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AI_KEY, claude, type ChatMsg } from "@/lib/ai";
import { buildCoachSystem, detectAvoidance, type Mode } from "@/lib/forge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!AI_KEY) return NextResponse.json({ error: "no_ai_key" }, { status: 503 });

  const { sessionId, content } = await req.json().catch(() => ({}));
  const text = (content || "").toString().trim();
  if (!sessionId || !text) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const session = await prisma.forgeSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (session.status !== "active") return NextResponse.json({ error: "closed" }, { status: 409 });

  const avoidance = detectAvoidance(text);
  await prisma.forgeMessage.create({ data: { sessionId, role: "user", content: text.slice(0, 8000), avoidance } });

  const history: ChatMsg[] = [
    ...session.messages.map((m) => ({ role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user", content: m.content })),
    { role: "user", content: text.slice(0, 8000) },
  ];
  const recent = await prisma.forgeCommitment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 1 });
  const sys = buildCoachSystem({
    name: user.name, pattern: user.forgePattern,
    mode: (session.mode as Mode) || "insight",
    lastCommitment: recent[0] ? { text: recent[0].text, status: recent[0].status } : null,
  });

  let reply: string;
  try { reply = await claude(sys, history, 350); }
  catch (e: any) { return NextResponse.json({ error: "ai_failed", message: e?.message || "Coach unavailable." }, { status: 502 }); }

  const cm = await prisma.forgeMessage.create({ data: { sessionId, role: "coach", content: reply } });
  return NextResponse.json({ message: { id: cm.id, role: "coach", content: reply }, avoidance });
}
