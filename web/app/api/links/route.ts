import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { candidateName } = await req.json().catch(() => ({}));
  const token = crypto.randomBytes(9).toString("base64url");
  const link = await prisma.verificationLink.create({
    data: { token, userId: user.id, candidateName: (candidateName || "").toString().trim().slice(0, 80) || null },
  });
  return NextResponse.json({ id: link.id, token: link.token });
}
