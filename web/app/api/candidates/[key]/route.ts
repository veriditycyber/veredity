import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { teamUserIds } from "@/lib/team";
import { eraseCandidate, exportCandidate } from "@/lib/retention";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET ?export=1 → download all data about the candidate (DSAR).
export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { key } = await params;
  const name = decodeURIComponent(key);
  const data = await exportCandidate(await teamUserIds(user), name);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="truehire-${key}.json"` },
  });
}

// DELETE → erase every record about the candidate across the workspace.
export async function DELETE(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { key } = await params;
  const name = decodeURIComponent(key);
  const counts = await eraseCandidate(await teamUserIds(user), name);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return NextResponse.json({ ok: true, counts, total });
}
