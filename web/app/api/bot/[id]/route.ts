import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { leaveBot } from "@/lib/recall";
import { anyProviderConfigured, AIError } from "@/lib/ai";
import { generateNotes, generateReport, analyzeIntegrity } from "@/lib/interviewBot";

export const runtime = "nodejs";
export const maxDuration = 60;

async function load(id: string, userId: string) {
  return prisma.interviewSession.findFirst({ where: { id, userId } });
}

// Poll — the live session page hits this on an interval.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const s = await load(id, user.id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    id: s.id, status: s.status, platform: s.platform, candidateName: s.candidateName, role: s.role,
    transcript: s.transcript, notes: s.notes,
    report: s.summary ? {
      summary: s.summary,
      strengths: JSON.parse(s.strengths || "[]"), concerns: JSON.parse(s.concerns || "[]"), questions: JSON.parse(s.questions || "[]"),
      recommendation: s.recommendation, fitScore: s.fitScore, model: s.model,
    } : null,
    integrity: s.integrity ? { ...JSON.parse(s.integrity), integrityScore: s.integrityScore } : null,
  });
}

// Actions: manual_transcript | notes | report | stop
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const s = await load(id, user.id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const modelId = body.model || user.aiModel;

  if (action === "manual_transcript") {
    const transcript = (body.transcript || "").toString();
    const updated = await prisma.interviewSession.update({ where: { id }, data: { transcript, status: "processing" } });
    return NextResponse.json({ ok: true, transcript: updated.transcript });
  }

  if (action === "stop") {
    if (s.botId) await leaveBot(s.botId);
    await prisma.interviewSession.update({ where: { id }, data: { status: "processing", endedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (action === "notes") {
    if (!anyProviderConfigured()) return NextResponse.json({ error: "no_ai_key", message: "Add an AI provider key to generate notes." }, { status: 503 });
    const notes = await generateNotes(s.transcript, modelId).catch(() => "");
    await prisma.interviewSession.update({ where: { id }, data: { notes } });
    return NextResponse.json({ ok: true, notes });
  }

  if (action === "report") {
    const transcript = (body.transcript || s.transcript || "").toString();
    if (transcript.trim().length < 60) return NextResponse.json({ error: "too_short", message: "Not enough transcript yet to build a report." }, { status: 400 });
    if (!anyProviderConfigured()) return NextResponse.json({ error: "no_ai_key", message: "Add an AI provider key (Claude, GPT, or Gemini) to generate the report." }, { status: 503 });
    let rep, integ;
    try {
      [rep, integ] = await Promise.all([
        generateReport(transcript, s.candidateName || "", s.role || "", modelId),
        analyzeIntegrity(transcript, modelId).catch(() => null),
      ]);
    } catch (e: any) {
      if (e instanceof AIError) return NextResponse.json({ error: e.code, message: e.message }, { status: e.code === "no_ai_key" ? 503 : 502 });
      return NextResponse.json({ error: "ai_failed", message: e?.message || "Report generation failed." }, { status: 502 });
    }
    const p = rep.parsed;
    if (!p) return NextResponse.json({ error: "parse", message: "Could not parse the AI report." }, { status: 502 });
    await prisma.interviewSession.update({
      where: { id },
      data: {
        transcript, status: "done", endedAt: s.endedAt || new Date(), model: rep.model,
        summary: p.summary || null,
        strengths: JSON.stringify(p.strengths || []), concerns: JSON.stringify(p.concerns || []), questions: JSON.stringify(p.questions || []),
        recommendation: p.recommendation || null,
        fitScore: typeof p.fitScore === "number" ? Math.max(0, Math.min(100, Math.round(p.fitScore))) : null,
        integrity: integ ? JSON.stringify({ flags: integ.flags }) : null,
        integrityScore: integ ? integ.integrityScore : null,
      },
    });
    return NextResponse.json({ ok: true, report: p, integrity: integ });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
