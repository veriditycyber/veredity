import { NextResponse } from "next/server";
import { API_KEY, MAX_MONTHLY_SCANS } from "@/lib/rd";
import { getCurrentUser } from "@/lib/auth";
import { monthlyCheckCount } from "@/lib/usage";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  const used = await monthlyCheckCount();
  return NextResponse.json({
    ok: true,
    configured: !!API_KEY,
    authed: !!user,
    scansLeft: Math.max(0, MAX_MONTHLY_SCANS - used),
  });
}
