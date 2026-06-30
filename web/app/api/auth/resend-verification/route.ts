import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { issueToken } from "@/lib/tokens";
import { sendEmail, verifyEmailHtml, appUrl, emailConfigured } from "@/lib/email";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ ok: true, already: true });
  if (!emailConfigured()) return NextResponse.json({ ok: false, message: "Email sending isn't configured yet (set RESEND_API_KEY)." }, { status: 503 });

  const token = await issueToken(user.id, "verify_email");
  const res = await sendEmail(user.email, "Confirm your Veridity email", verifyEmailHtml(`${appUrl()}/verify-email?token=${token}`));
  if (!res.sent) return NextResponse.json({ ok: false, message: "Could not send the email. Try again shortly." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
