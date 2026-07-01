import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeTrust } from "@/lib/trust";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX = 50;

type Row = { candidateName?: string; email?: string; phone?: string; claimedCountry?: string };

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rows: Row[] = Array.isArray(body.candidates) ? body.candidates.slice(0, MAX) : [];
  const clean = rows.filter((r) => (r.email || r.phone || r.candidateName));
  if (clean.length === 0) return NextResponse.json({ error: "empty", message: "No candidates to screen." }, { status: 400 });

  const results = await mapLimit(clean, 6, async (r) => {
    const claimedCountry = (r.claimedCountry || "").toString().trim().toUpperCase() || undefined;
    const res = await computeTrust({ candidateName: r.candidateName, email: r.email, phone: r.phone, claimedCountry, reporterId: user.id }).catch(() => null);
    if (!res) return { candidateName: r.candidateName || null, email: r.email || null, score: null, band: "—" as string };
    await prisma.trustReport.create({
      data: {
        userId: user.id, candidateName: (r.candidateName || "").slice(0, 200) || null,
        email: (r.email || "").slice(0, 200) || null, phone: (r.phone || "").slice(0, 60) || null,
        claimedCountry: claimedCountry || null, score: res.score, band: res.band, signals: JSON.stringify(res.signals),
      },
    }).catch(() => {});
    return { candidateName: r.candidateName || null, email: r.email || null, score: res.score, band: res.band };
  });

  const summary = {
    total: results.length,
    green: results.filter((r) => r.band === "green").length,
    yellow: results.filter((r) => r.band === "yellow").length,
    red: results.filter((r) => r.band === "red").length,
  };
  return NextResponse.json({ results, summary });
}
