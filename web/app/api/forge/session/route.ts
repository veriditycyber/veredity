import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { anyProviderConfigured, claude } from "@/lib/ai";
import { selectMode, buildCoachSystem, type Mode } from "@/lib/forge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!anyProviderConfigured()) return NextResponse.json({ error: "no_ai_key", message: "Forge needs an AI provider key (e.g. ANTHROPIC_API_KEY) to run the coach." }, { status: 503 });

  const { decisionContext, model } = await req.json().catch(() => ({}));
  const modelId = model || user.aiModel;
  const recent = await prisma.forgeCommitment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 });
  const mode = selectMode(recent);
  const lastCommitment = recent[0] ? { text: recent[0].text, status: recent[0].status } : null;

  const session = await prisma.forgeSession.create({
    data: { userId: user.id, mode, decisionContext: (decisionContext || "").toString().slice(0, 500) || null, status: "active" },
  });

  const sys = buildCoachSystem({ name: user.name, pattern: user.forgePattern, mode, lastCommitment });
  const openingPrompt = decisionContext
    ? `The founder wants to work through: "${decisionContext}". Open the session — go straight at it.`
    : `Open the session. Ask what decision they keep going back and forth on. One question only.`;
  let opening: string;
  try { opening = await claude(sys, [{ role: "user", content: openingPrompt }], 300, modelId); }
  catch { opening = "What decision have you been going back and forth on this week?"; }

  const msg = await prisma.forgeMessage.create({ data: { sessionId: session.id, role: "coach", content: opening } });
  return NextResponse.json({ sessionId: session.id, mode, message: { id: msg.id, role: "coach", content: opening } });
}
