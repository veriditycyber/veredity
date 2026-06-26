import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const BAND_LABEL: Record<string, string> = { green: "Genuine", yellow: "Review", red: "High risk" };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const checks = await prisma.check.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const header = ["Date", "Candidate", "File", "Result", "Risk score", "RD status", "Engine", "Check ID"];
  const lines = [
    header.map(esc).join(","),
    ...checks.map((c) =>
      [
        new Date(c.createdAt).toISOString(),
        c.candidateName || "",
        c.fileName,
        c.band ? BAND_LABEL[c.band] || c.band : c.status,
        c.score ?? "",
        c.rdStatus || "",
        c.engine || "",
        c.id,
      ].map(esc).join(","),
    ),
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="veridity-audit-trail.csv"',
    },
  });
}
