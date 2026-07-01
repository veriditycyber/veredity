import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recallConfigured, createBot, detectPlatform } from "@/lib/recall";
import { appUrl } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const meetingUrl = (body.meetingUrl || "").toString().trim();
  const candidateName = (body.candidateName || "").toString().slice(0, 200) || null;
  const role = (body.role || "").toString().slice(0, 200) || null;
  const platform = meetingUrl ? detectPlatform(meetingUrl) : "manual";

  const session = await prisma.interviewSession.create({
    data: { userId: user.id, candidateName, role, meetingUrl: meetingUrl || null, platform, status: meetingUrl ? "scheduled" : "manual" },
  });

  // If a meeting URL is provided and Recall is configured, send the bot in.
  if (meetingUrl) {
    if (!recallConfigured()) {
      return NextResponse.json({ id: session.id, botConfigured: false, message: "Live bot needs RECALL_API_KEY. Session created in manual mode — paste the transcript to analyze." });
    }
    try {
      const bot = await createBot(meetingUrl, { webhookUrl: `${appUrl()}/api/bot/webhook`, botName: "TrueHire Notetaker" });
      await prisma.interviewSession.update({ where: { id: session.id }, data: { botId: bot.id, status: "joining" } });
      return NextResponse.json({ id: session.id, botConfigured: true, botId: bot.id });
    } catch (e: any) {
      await prisma.interviewSession.update({ where: { id: session.id }, data: { status: "failed" } });
      return NextResponse.json({ id: session.id, botConfigured: true, error: "bot_failed", message: e?.message || "Couldn't send the bot into the meeting." }, { status: 502 });
    }
  }

  return NextResponse.json({ id: session.id, botConfigured: false, manual: true });
}
