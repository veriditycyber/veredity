import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeTrust } from "@/lib/trust";
import { createAlert } from "@/lib/alerts";
import { dispatch } from "@/lib/webhooks";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const resumeText = (body.resumeText || "").toString();
  if (!email && !phone && resumeText.trim().length < 80) {
    return NextResponse.json({ error: "empty", message: "Provide at least an email, a phone number, or a résumé to score." }, { status: 400 });
  }

  // Optionally pull the band from a linked deepfake check.
  let checkBand: string | null = null;
  if (body.checkId) {
    const chk = await prisma.check.findFirst({ where: { id: body.checkId.toString(), userId: user.id }, select: { band: true } });
    checkBand = chk?.band ?? null;
  }

  const claimedCountry = (body.claimedCountry || "").toString().trim().toUpperCase() || undefined;
  const result = await computeTrust({
    candidateName: body.candidateName, email, phone, claimedCountry,
    resumeText, checkBand, model: body.model || user.aiModel, reporterId: user.id,
  });

  const report = await prisma.trustReport.create({
    data: {
      userId: user.id,
      candidateName: (body.candidateName || "").toString().slice(0, 200) || null,
      email: email.slice(0, 200) || null,
      phone: phone.slice(0, 60) || null,
      claimedCountry: claimedCountry || null,
      score: result.score,
      band: result.band,
      signals: JSON.stringify(result.signals),
      checkId: body.checkId ? body.checkId.toString() : null,
      resumeFlag: result.resumeFlag || null,
      model: result.model || null,
    },
  });

  const eventPayload = { id: report.id, candidateName: body.candidateName || null, email: email || null, phone: phone || null, score: result.score, band: result.band };
  await dispatch(user.id, "candidate.scored", eventPayload);
  if (result.band === "red") {
    await createAlert(user.id, { candidateName: body.candidateName, band: "red", source: "trust", email: user.email, message: `${body.candidateName || email || phone || "A candidate"} scored ${result.score}/100 — high risk on a trust check.` });
    await dispatch(user.id, "candidate.high_risk", eventPayload);
  }

  return NextResponse.json({ id: report.id, ...result });
}
