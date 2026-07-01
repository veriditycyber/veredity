import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/email";

export const runtime = "nodejs";

// Publish a Trust report as a public "TrueHire Verified" page (mints a token once).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.trustReport.findFirst({ where: { id, userId: user.id } });
  if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let token = report.shareToken;
  if (!token) {
    token = "thv_" + crypto.randomBytes(16).toString("hex");
    await prisma.trustReport.update({ where: { id }, data: { shareToken: token } });
  }
  return NextResponse.json({ token, url: `${appUrl()}/verified/${token}` });
}
