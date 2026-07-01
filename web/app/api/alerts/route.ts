import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { teamUserIds } from "@/lib/team";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ids = await teamUserIds(user);
  const countOnly = new URL(req.url).searchParams.get("count") === "1";
  const unread = await prisma.alert.count({ where: { userId: { in: ids }, read: false } });
  if (countOnly) return NextResponse.json({ unread });
  const alerts = await prisma.alert.findMany({ where: { userId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ alerts, unread });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { action, id } = await req.json().catch(() => ({}));
  if (action === "read_all") await prisma.alert.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  else if (action === "read" && id) await prisma.alert.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  else if (action === "clear") await prisma.alert.deleteMany({ where: { userId: user.id } });
  else return NextResponse.json({ error: "bad_action" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
