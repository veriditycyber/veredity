import { NextResponse } from "next/server";
import { API_KEY, rdClient, saveTemp, unlinkQuiet } from "@/lib/rd";
import { getCurrentUser } from "@/lib/auth";
import { monthlyCheckCount } from "@/lib/usage";
import { effectiveScanLimit } from "@/lib/plans";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Step 1: authenticate, enforce quota, upload the file to Reality Defender,
// create an ANALYZING Check row, and return its id + the RD requestId.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!API_KEY) return NextResponse.json({ error: "no_api_key", message: "Detection is not configured on the server." }, { status: 503 });

  const used = await monthlyCheckCount();
  if (used >= effectiveScanLimit(user.plan)) {
    return NextResponse.json({ error: "quota", message: "Monthly scan limit reached for your plan. Upgrade in Billing, or it resets next month." }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  const candidateName = (form.get("candidateName")?.toString() || "").trim().slice(0, 80) || null;

  let filePath: string | undefined;
  try {
    filePath = await saveTemp(file);
    const { requestId } = await rdClient().upload({ filePath });
    const check = await prisma.check.create({
      data: {
        userId: user.id,
        candidateName,
        fileName: file.name,
        mediaType: file.type || null,
        status: "ANALYZING",
        requestId,
        engine: "realitydefender",
      },
    });
    return NextResponse.json({ checkId: check.id, requestId, filename: file.name, candidateName });
  } catch (err: any) {
    return NextResponse.json({ error: "upload_failed", message: err?.message || String(err) }, { status: 502 });
  } finally {
    if (filePath) await unlinkQuiet(filePath);
  }
}
