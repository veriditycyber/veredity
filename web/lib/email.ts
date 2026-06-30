// Transactional email via Resend (https://resend.com). Server-only.
// Degrades gracefully: if RESEND_API_KEY is missing, sendEmail returns
// { sent:false } instead of throwing, so flows keep working in dev.

const RESEND_KEY = process.env.RESEND_API_KEY || "";
const FROM = process.env.EMAIL_FROM || "Veridity <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return !!RESEND_KEY;
}

export function appUrl(): string {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
  if (!RESEND_KEY) return { sent: false, error: "no_email_key" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) return { sent: false, error: (await r.text()).slice(0, 200) };
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e?.message || "send_failed" };
  }
}

// ---- branded templates (monochrome, inline styles for mail clients) ----
function shell(title: string, body: string, cta?: { label: string; url: string }): string {
  return `<div style="background:#0a0a0c;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#17171b;border:1px solid #28282e;border-radius:16px;padding:32px;color:#fafafa">
    <div style="font-size:20px;font-weight:700;letter-spacing:-.01em;margin-bottom:4px">Veridity</div>
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#9b9ba6;margin-bottom:24px">AI that tells you the truth</div>
    <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#cfcfd6">${body}</div>
    ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:22px;background:#fafafa;color:#0a0a0b;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px">${cta.label}</a>
    <div style="font-size:12px;color:#67676f;margin-top:18px;word-break:break-all">Or paste this link:<br>${cta.url}</div>` : ""}
    <div style="font-size:11px;color:#67676f;margin-top:28px;border-top:1px solid #28282e;padding-top:16px">© Veridity · veridity.in · You received this because someone used this email to sign up.</div>
  </div>
</div>`;
}

export function verifyEmailHtml(url: string): string {
  return shell("Confirm your email", "Welcome to Veridity. Confirm this email address to secure your account and unlock everything.", { label: "Verify email", url });
}
export function resetPasswordHtml(url: string): string {
  return shell("Reset your password", "We received a request to reset your Veridity password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.", { label: "Reset password", url });
}
