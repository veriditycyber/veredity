import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password, name, company } = await req.json().catch(() => ({}));
  const e = (email || "").toString().trim().toLowerCase();
  if (!e || !e.includes("@") || !password || password.length < 8) {
    return NextResponse.json({ error: "invalid", message: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: e } });
  if (existing) {
    return NextResponse.json({ error: "exists", message: "An account with this email already exists." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { email: e, passwordHash: hashPassword(password), name: name || null, company: company || null },
  });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
