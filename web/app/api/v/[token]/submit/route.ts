import { NextResponse } from "next/server";
import { API_KEY, MAX_MONTHLY_SCANS, saveTemp, unlinkQuiet, detectSettled } from "@/lib/rd";
import { monthlyCheckCount } from "@/lib/usage";
import { matchFaces, faceMatchConfigured } from "@/lib/facematch";
import { createAlert } from "@/lib/alerts";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Public endpoint — a candidate submits their media against a verification link.
// No auth; the link token ties the result to the recruiter who created it.
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const link = await prisma.verificationLink.findUnique({ where: { token } });
  if (!link) return NextResponse.json({ error: "invalid_link" }, { status: 404 });
  if (link.status === "done") return NextResponse.json({ error: "already_done", message: "This link has already been used." }, { status: 409 });
  if (!API_KEY) return NextResponse.json({ error: "no_api_key" }, { status: 503 });

  const used = await monthlyCheckCount();
  if (used >= MAX_MONTHLY_SCANS) {
    return NextResponse.json({ error: "quota", message: "Verification is temporarily unavailable. Please contact the company." }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  const idFile = form.get("id");
  const liveness = form.get("liveness") === "1";

  let selfiePath: string | undefined;
  try {
    selfiePath = await saveTemp(file);
    const { verdict, rdStatus } = await detectSettled(selfiePath, file.name);

    // ID mode: face-match the live selfie against the government ID (if a provider is set).
    let faceMatchScore: number | null = null;
    if (link.mode === "id" && idFile instanceof File && faceMatchConfigured()) {
      const [selfieBuf, idBuf] = await Promise.all([file.arrayBuffer(), idFile.arrayBuffer()]);
      faceMatchScore = await matchFaces(Buffer.from(selfieBuf), Buffer.from(idBuf)).catch(() => null);
    }

    const check = await prisma.check.create({
      data: {
        userId: link.userId,
        candidateName: link.candidateName,
        fileName: file.name,
        mediaType: file.type || null,
        band: verdict.band,
        score: typeof verdict.score === "number" ? verdict.score : null,
        rdStatus,
        engine: "realitydefender",
        signals: JSON.stringify(verdict.signals),
        status: "DONE",
      },
    });
    await prisma.verificationLink.update({
      where: { token },
      data: {
        status: "done", checkId: check.id,
        livenessPassed: link.mode === "id" ? liveness : false,
        idChecked: link.mode === "id" && idFile instanceof File,
        faceMatchScore,
      },
    });
    if (verdict.band === "red") {
      const u = await prisma.user.findUnique({ where: { id: link.userId }, select: { email: true } });
      await createAlert(link.userId, { candidateName: link.candidateName, band: "red", source: "link", email: u?.email, message: `A candidate self-verification (${link.candidateName || "unnamed"}) came back high-risk — likely synthetic media.` });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "detect_failed", message: err?.message || String(err) }, { status: 502 });
  } finally {
    if (selfiePath) await unlinkQuiet(selfiePath);
  }
}
