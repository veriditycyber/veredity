import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { purgeExpired } from "@/lib/retention";

export const runtime = "nodejs";
export const maxDuration = 60;

// Secret-gated: a scheduled job purges expired data for every user with a policy.
export async function POST(req: Request) {
  const secret = process.env.RETENTION_CRON_SECRET;
  const body = await req.json().catch(() => ({}));
  if (!secret || body.secret !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({ where: { retentionDays: { not: null } }, select: { id: true, retentionDays: true }, take: 500 });
  let total = 0;
  for (const u of users) {
    if (u.retentionDays) { const c = await purgeExpired(u.id, u.retentionDays); total += Object.values(c).reduce((a, b) => a + b, 0); }
  }
  return NextResponse.json({ ok: true, users: users.length, deleted: total });
}
