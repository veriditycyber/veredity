import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { purgeExpired } from "@/lib/retention";
import { isAdmin } from "@/lib/perms";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden", message: "Only admins can change data-retention settings." }, { status: 403 });
  const { action, retentionDays } = await req.json().catch(() => ({}));

  if (action === "set_retention") {
    const d = retentionDays === null || retentionDays === "" ? null : Math.max(1, Math.min(3650, Math.round(Number(retentionDays))));
    await prisma.user.update({ where: { id: user.id }, data: { retentionDays: d } });
    return NextResponse.json({ ok: true, retentionDays: d });
  }

  if (action === "purge_now") {
    const days = user.retentionDays || Number(retentionDays);
    if (!days || days < 1) return NextResponse.json({ ok: false, message: "Set a retention window first." }, { status: 400 });
    const counts = await purgeExpired(user.id, days);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return NextResponse.json({ ok: true, counts, total });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
