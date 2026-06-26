import { NextResponse } from "next/server";
import { API_KEY } from "@/lib/rd";
import { getCurrentUser } from "@/lib/auth";
import { monthlyCheckCount } from "@/lib/usage";
import { effectiveScanLimit } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  const used = await monthlyCheckCount();
  return NextResponse.json({
    ok: true,
    configured: !!API_KEY,
    authed: !!user,
    scansLeft: Math.max(0, effectiveScanLimit(user?.plan) - used),
  });
}
