import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const OK = new Set(["done", "in_progress", "not_done"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { commitmentId, status } = await req.json().catch(() => ({}));
  if (!commitmentId || !OK.has(status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await prisma.forgeCommitment.updateMany({ where: { id: commitmentId, userId: user.id }, data: { status } });
  return NextResponse.json({ ok: true });
}
