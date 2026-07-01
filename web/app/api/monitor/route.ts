import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const monitors = await prisma.monitor.findMany({ where: { userId: user.id }, orderBy: { nextDueAt: "asc" } });
  return NextResponse.json({ monitors });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = body.action || "create";

  if (action === "pause" || action === "resume") {
    await prisma.monitor.updateMany({ where: { id: body.id, userId: user.id }, data: { status: action === "pause" ? "paused" : "active" } });
    return NextResponse.json({ ok: true });
  }
  if (action === "remove") {
    await prisma.monitor.deleteMany({ where: { id: body.id, userId: user.id } });
    return NextResponse.json({ ok: true });
  }

  // create
  const email = (body.email || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const subjectName = (body.subjectName || "").toString().trim();
  if (!email && !phone && !subjectName) return NextResponse.json({ error: "empty", message: "Add a name, email, or phone." }, { status: 400 });
  const intervalDays = Math.max(1, Math.min(365, Math.round(Number(body.intervalDays) || 30)));
  const nextDueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  const m = await prisma.monitor.create({
    data: {
      userId: user.id, subjectName: subjectName || null, email: email || null, phone: phone || null,
      claimedCountry: (body.claimedCountry || "").toString().trim().toUpperCase() || null,
      intervalDays, nextDueAt,
    },
  });
  return NextResponse.json({ ok: true, id: m.id });
}
