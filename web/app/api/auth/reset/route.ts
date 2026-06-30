import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { consumeToken } from "@/lib/tokens";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!password || password.length < 8) {
    return NextResponse.json({ ok: false, message: "Choose a password of at least 8 characters." }, { status: 400 });
  }
  const userId = await consumeToken((token || "").toString(), "reset_password");
  if (!userId) return NextResponse.json({ ok: false, message: "This reset link is invalid or has expired." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashPassword(password) } });
  // Invalidate other sessions, then sign the user in fresh.
  await prisma.session.deleteMany({ where: { userId } });
  await createSession(userId);
  return NextResponse.json({ ok: true });
}
