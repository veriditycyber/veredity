import { NextResponse } from "next/server";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { confirm } = await req.json().catch(() => ({}));
  if (confirm !== "DELETE") {
    return NextResponse.json({ ok: false, message: 'Type DELETE to confirm.' }, { status: 400 });
  }
  await destroySession();
  // All related rows cascade on delete (sessions, checks, interviews, forge, tokens, subscription, payments).
  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ ok: true });
}
