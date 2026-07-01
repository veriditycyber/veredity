import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Receives Recall.ai events: real-time transcript chunks and bot status changes.
// Configure account-level status webhooks + per-bot realtime endpoints to point here.
const STATUS_MAP: Record<string, string> = {
  joining_call: "joining", in_waiting_room: "joining", in_call_not_recording: "in_call",
  in_call_recording: "in_call", recording_permission_allowed: "in_call",
  call_ended: "processing", done: "done", fatal: "failed", bot_rejected: "failed",
};

function extractText(data: any): { text: string; speaker?: string } | null {
  // Handle a few shapes Recall has used for transcript payloads.
  const d = data?.data ?? data?.transcript ?? data;
  const words = d?.words || d?.data?.words;
  const speaker = d?.participant?.name || d?.speaker || d?.data?.participant?.name;
  if (Array.isArray(words) && words.length) return { text: words.map((w: any) => w.text || w.word || "").join(" ").trim(), speaker };
  if (typeof d?.text === "string") return { text: d.text.trim(), speaker };
  return null;
}

export async function POST(req: Request) {
  const secret = process.env.RECALL_WEBHOOK_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const provided = req.headers.get("x-webhook-secret") || url.searchParams.get("secret");
    if (provided !== secret) return NextResponse.json({ error: "bad_secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const event: string = body.event || "";
  const data = body.data || {};
  const botId = data?.bot?.id || data?.bot_id || data?.data?.bot?.id;
  if (!botId) return NextResponse.json({ ok: true });

  const session = await prisma.interviewSession.findFirst({ where: { botId } });
  if (!session) return NextResponse.json({ ok: true });

  if (event.startsWith("transcript.")) {
    const parsed = extractText(data);
    if (parsed?.text) {
      const line = `${parsed.speaker ? parsed.speaker + ": " : ""}${parsed.text}\n`;
      await prisma.interviewSession.update({ where: { id: session.id }, data: { transcript: (session.transcript || "") + line } });
    }
    return NextResponse.json({ ok: true });
  }

  if (event.includes("status")) {
    const code = data?.status?.code || data?.code || "";
    const mapped = STATUS_MAP[code];
    if (mapped) {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: mapped, ...(mapped === "processing" || mapped === "done" ? { endedAt: new Date() } : {}), ...(data?.recording?.url ? { recordingUrl: data.recording.url } : {}) },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
