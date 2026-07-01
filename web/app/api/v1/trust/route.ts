import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey } from "@/lib/apikey";
import { computeTrust } from "@/lib/trust";

export const runtime = "nodejs";
export const maxDuration = 60;

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "POST, OPTIONS" };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Public Trust API — authenticate with a developer key (Authorization: Bearer thk_live_…).
export async function POST(req: Request) {
  const user = await authenticateApiKey(req);
  if (!user) return NextResponse.json({ error: "unauthorized", message: "Missing or invalid API key." }, { status: 401, headers: CORS });

  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const resumeText = (body.resumeText || body.resume || "").toString();
  if (!email && !phone && resumeText.trim().length < 80) {
    return NextResponse.json({ error: "empty", message: "Provide at least an email, phone, or résumé." }, { status: 400, headers: CORS });
  }

  const claimedCountry = (body.claimedCountry || "").toString().trim().toUpperCase() || undefined;
  const result = await computeTrust({ candidateName: body.candidateName, email, phone, claimedCountry, resumeText, model: user.aiModel });

  // Log to the key owner's history so API + dashboard stay unified.
  const report = await prisma.trustReport.create({
    data: {
      userId: user.id,
      candidateName: (body.candidateName || "").toString().slice(0, 200) || null,
      email: email.slice(0, 200) || null, phone: phone.slice(0, 60) || null,
      claimedCountry: claimedCountry || null,
      score: result.score, band: result.band, signals: JSON.stringify(result.signals),
      resumeFlag: result.resumeFlag || null, model: result.model || null,
    },
  });

  return NextResponse.json({
    id: report.id, score: result.score, band: result.band,
    signals: result.signals.map((s) => ({ key: s.key, label: s.label, status: s.status, detail: s.detail })),
  }, { headers: CORS });
}
