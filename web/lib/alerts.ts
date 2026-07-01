// High-risk alerts — created when a red result lands, surfaced via the topbar bell
// and (optionally) emailed. Best-effort: never throws into the calling flow.
import { prisma } from "./db";
import { sendEmail, emailConfigured, appUrl } from "./email";

export async function createAlert(
  userId: string,
  opts: { candidateName?: string | null; band: string; source: "trust" | "bulk" | "monitor" | "link"; message: string; email?: string | null },
): Promise<void> {
  try {
    await prisma.alert.create({ data: { userId, candidateName: opts.candidateName || null, band: opts.band, source: opts.source, message: opts.message } });
    if (opts.email && emailConfigured()) {
      const html = `<div style="font-family:sans-serif"><h2 style="margin:0 0 8px">⚠️ High-risk candidate flagged</h2>
        <p style="font-size:14px;color:#333">${opts.message}</p>
        <a href="${appUrl()}/alerts" style="display:inline-block;margin-top:12px;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">View in TrueHire</a></div>`;
      await sendEmail(opts.email, "TrueHire: high-risk candidate flagged", html).catch(() => {});
    }
  } catch {}
}
