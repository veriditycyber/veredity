import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { brandName, brandColor } = await req.json().catch(() => ({}));
  const name = (brandName || "").toString().slice(0, 60).trim() || null;
  const color = /^#[0-9a-fA-F]{6}$/.test((brandColor || "").toString()) ? brandColor : null;
  await prisma.user.update({ where: { id: user.id }, data: { brandName: name, brandColor: color } });
  return NextResponse.json({ ok: true });
}
