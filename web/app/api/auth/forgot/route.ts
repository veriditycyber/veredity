import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueToken } from "@/lib/tokens";
import { sendEmail, resetPasswordHtml, appUrl } from "@/lib/email";

export const runtime = "nodejs";

// Always returns ok (don't reveal whether an email exists). Sends a reset link
// only if the account exists and has a password.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  const e = (email || "").toString().trim().toLowerCase();
  if (e && e.includes("@")) {
    const user = await prisma.user.findUnique({ where: { email: e } });
    if (user) {
      try {
        const token = await issueToken(user.id, "reset_password");
        await sendEmail(e, "Reset your Veridity password", resetPasswordHtml(`${appUrl()}/reset-password?token=${token}`));
      } catch {}
    }
  }
  return NextResponse.json({ ok: true });
}
