import { NextResponse } from "next/server";
import { rdClient, mapResult, MAX_MONTHLY_SCANS } from "@/lib/rd";
import { getCurrentUser } from "@/lib/auth";
import { monthlyCheckCount } from "@/lib/usage";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Step 2: poll one getResult. Returns settled:false while models analyze.
// When settled, persist the verdict onto the Check row.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const checkId = searchParams.get("checkId") || "";
  const filename = searchParams.get("filename") || "file";
  const candidate = searchParams.get("candidate") || "";
  if (!id) return NextResponse.json({ error: "no_id" }, { status: 400 });

  try {
    const result: any = await rdClient().getResult(id);
    // The top-level verdict is ready as soon as RD's overall status is decided,
    // even while some sub-models keep refining — so settle on that, not on every model.
    const settled = !!result.status && result.status !== "ANALYZING";
    const verdict = mapResult(result, filename);
    if (candidate) verdict.name = `${candidate} — ${filename}`;
    verdict.checkId = checkId;

    if (settled && checkId) {
      await prisma.check.updateMany({
        where: { id: checkId, userId: user.id },
        data: {
          band: verdict.band,
          score: typeof verdict.score === "number" ? verdict.score : null,
          rdStatus: result.status,
          signals: JSON.stringify(verdict.signals),
          status: "DONE",
        },
      });
    }

    const used = await monthlyCheckCount();
    verdict.scansLeft = Math.max(0, MAX_MONTHLY_SCANS - used);
    return NextResponse.json({ settled, verdict });
  } catch (err: any) {
    return NextResponse.json({ error: "result_failed", message: err?.message || String(err) }, { status: 502 });
  }
}
