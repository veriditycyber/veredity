import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";

export const runtime = "nodejs";

// Consumes a verify_email token and marks the user verified. Returns JSON;
// the /verify-email page calls this and shows the result.
export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  const userId = await consumeToken((token || "").toString(), "verify_email");
  if (!userId) return NextResponse.json({ ok: false, message: "This link is invalid or has expired. Request a new one." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  return NextResponse.json({ ok: true });
}
