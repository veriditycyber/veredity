import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const e = (email || "").toString().trim().toLowerCase();
  const user = e ? await prisma.user.findUnique({ where: { email: e } }) : null;
  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return NextResponse.json({ error: "bad_credentials", message: "Incorrect email or password." }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
