import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { teamUserIds } from "@/lib/team";
import { listCandidates } from "@/lib/candidates";

export const runtime = "nodejs";

// Candidate search for the command palette.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ candidates: [] });
  const all = await listCandidates(await teamUserIds(user), q);
  return NextResponse.json({ candidates: all.slice(0, 8).map((c) => ({ key: c.key, name: c.name, email: c.email || null, band: c.worstBand })) });
}
