import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { candidateName, mode } = await req.json().catch(() => ({}));
  const token = crypto.randomBytes(9).toString("base64url");
  const isId = mode === "id";
  const challengeCode = isId ? String(Math.floor(1000 + Math.random() * 9000)) : null;
  const link = await prisma.verificationLink.create({
    data: {
      token, userId: user.id,
      candidateName: (candidateName || "").toString().trim().slice(0, 80) || null,
      mode: isId ? "id" : "basic",
      challengeCode,
    },
  });
  return NextResponse.json({ id: link.id, token: link.token, mode: link.mode });
}
