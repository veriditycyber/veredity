import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BAND_TITLE, BAND_REC, type Band, type Sig, type Verdict } from "@/lib/types";
import Topbar from "@/components/Topbar";
import VerdictCard from "@/components/VerdictCard";
import PrintButton from "@/components/PrintButton";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function CheckDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const check = await prisma.check.findFirst({ where: { id, userId: user.id } });
  if (!check) notFound();

  const band: Band = (check.band as Band) || "yellow";
  const signals: Sig[] = check.signals ? JSON.parse(check.signals) : [];
  const verdict: Verdict = {
    name: check.candidateName ? `${check.candidateName} — ${check.fileName}` : check.fileName,
    role: "", kind: "",
    band,
    score: typeof check.score === "number" ? check.score : "",
    title: check.status === "ANALYZING" ? "Analysis in progress…" : BAND_TITLE[band],
    sub: check.rdStatus ? `Reality Defender status: ${check.rdStatus}` : "",
    signals: signals.length ? signals : [{ s: "na", t: "No detailed signals recorded." }],
    rec: check.status === "DONE" ? BAND_REC[band] : "",
  };

  return (
    <>
      <Topbar title="Verification Report" crumb="History · Detail"
        right={<Link className="btn btn-ghost" href="/history">← Back</Link>} />
      <div className="content">
        <div className="card">
          <div className="report-head" style={{ marginBottom: 14 }}>
            <div className="logo" style={{ fontSize: 16 }}><LogoMark size={22} /> Veridity — Candidate Verification Report</div>
          </div>
          <VerdictCard
            verdict={verdict}
            metaLeft={`Check ID: ${check.id}`}
            metaRight={`Checked ${new Date(check.createdAt).toLocaleString()} · Human review required`}
          />
          <div className="result-actions noprint">
            <PrintButton />
            <Link className="btn btn-ghost" href="/check">Run another check</Link>
          </div>
        </div>
      </div>
    </>
  );
}
