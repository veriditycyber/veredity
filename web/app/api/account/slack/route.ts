import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postSlack } from "@/lib/slack";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { url, test } = await req.json().catch(() => ({}));

  if (test) {
    if (!user.slackWebhook) return NextResponse.json({ ok: false, message: "Save a Slack webhook first." }, { status: 400 });
    const sent = await postSlack(user.slackWebhook, ":white_check_mark: TrueHire is connected — you'll get high-risk alerts here.");
    return NextResponse.json({ ok: sent, message: sent ? "Test message sent to Slack." : "Slack didn't accept the message. Check the URL." });
  }

  const u = (url || "").toString().trim();
  if (u && !/^https:\/\/hooks\.slack\.com\//.test(u)) return NextResponse.json({ ok: false, message: "Enter a valid Slack incoming-webhook URL." }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { slackWebhook: u || null } });
  return NextResponse.json({ ok: true });
}
