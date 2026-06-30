import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: "New password must be at least 8 characters." }, { status: 400 });
  }
  // If a password is already set, require the current one. OAuth-only accounts can set one freely.
  if (user.passwordHash) {
    if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ ok: false, message: "Current password is incorrect." }, { status: 400 });
    }
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword) } });
  return NextResponse.json({ ok: true, message: user.passwordHash ? "Password updated." : "Password set — you can now sign in with email too." });
}
