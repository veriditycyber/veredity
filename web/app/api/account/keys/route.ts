import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/apikey";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id, revokedAt: null }, orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { action, name, id } = await req.json().catch(() => ({}));

  if (action === "revoke") {
    if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    await prisma.apiKey.updateMany({ where: { id, userId: user.id }, data: { revokedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  // create
  const count = await prisma.apiKey.count({ where: { userId: user.id, revokedAt: null } });
  if (count >= 10) return NextResponse.json({ error: "limit", message: "You can have up to 10 active keys." }, { status: 400 });
  const { plaintext, prefix, keyHash } = generateApiKey();
  const key = await prisma.apiKey.create({ data: { userId: user.id, name: (name || "API key").toString().slice(0, 80), prefix, keyHash } });
  // plaintext returned exactly once — never stored.
  return NextResponse.json({ id: key.id, name: key.name, prefix, key: plaintext });
}
