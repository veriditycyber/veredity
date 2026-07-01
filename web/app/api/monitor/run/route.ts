import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeTrust } from "@/lib/trust";
import { createAlert } from "@/lib/alerts";

export const runtime = "nodejs";
export const maxDuration = 60;

async function runOne(m: { id: string; userId: string; subjectName: string | null; email: string | null; phone: string | null; claimedCountry: string | null; intervalDays: number }) {
  const res = await computeTrust({
    candidateName: m.subjectName || undefined, email: m.email || undefined, phone: m.phone || undefined,
    claimedCountry: m.claimedCountry || undefined, reporterId: m.userId,
  }).catch(() => null);
  const now = new Date();
  const next = new Date(now.getTime() + m.intervalDays * 24 * 60 * 60 * 1000);
  await prisma.monitor.update({
    where: { id: m.id },
    data: { lastRunAt: now, nextDueAt: next, runs: { increment: 1 }, ...(res ? { lastScore: res.score, lastBand: res.band } : {}) },
  });
  if (res) {
    await prisma.trustReport.create({
      data: { userId: m.userId, candidateName: m.subjectName, email: m.email, phone: m.phone, claimedCountry: m.claimedCountry, score: res.score, band: res.band, signals: JSON.stringify(res.signals) },
    }).catch(() => {});
    if (res.band === "red") {
      const u = await prisma.user.findUnique({ where: { id: m.userId }, select: { email: true } });
      await createAlert(m.userId, { candidateName: m.subjectName, band: "red", source: "monitor", email: u?.email, message: `Continuous monitoring flagged ${m.subjectName || m.email || "a monitored hire"} as high-risk (score ${res.score}).` });
    }
  }
  return res ? { id: m.id, score: res.score, band: res.band } : { id: m.id, score: null, band: null };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Cron mode: a scheduled trigger runs all due monitors across accounts.
  const cronSecret = process.env.MONITOR_CRON_SECRET;
  if (body.cron && cronSecret && body.secret === cronSecret) {
    const due = await prisma.monitor.findMany({ where: { status: "active", nextDueAt: { lte: new Date() } }, take: 200 });
    const results = [];
    for (const m of due) results.push(await runOne(m));
    return NextResponse.json({ ok: true, ran: results.length });
  }

  // Authenticated "run now" for a single monitor the user owns.
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const m = await prisma.monitor.findFirst({ where: { id: body.id, userId: user.id } });
  if (!m) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const r = await runOne(m);
  return NextResponse.json({ ok: true, ...r });
}
