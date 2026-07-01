import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recallConfigured } from "@/lib/recall";
import { anyProviderConfigured } from "@/lib/ai";
import Topbar from "@/components/Topbar";
import BotStart from "@/components/BotStart";
import { Camera, Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled", manual: "Manual", joining: "Joining", in_call: "In call", processing: "Processing", done: "Complete", failed: "Failed",
};

export default async function BotPage() {
  const user = (await getCurrentUser())!;
  const recent = await prisma.interviewSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 });

  return (
    <>
      <Topbar title="Interview Bot" crumb="Live interviews"
        right={<span className="pill"><Camera /> Notetaker</span>} />
      <div className="content" style={{ maxWidth: 960 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>A bot that sits in your interviews</h2>
          <p>Drop in a meeting link and TrueHire&apos;s bot joins the call, transcribes it live, takes notes, checks interview integrity, and hands you a scored report the moment it ends.</p>
        </div>

        {!anyProviderConfigured() && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="hint" style={{ margin: 0 }}>⚠️ Notes &amp; reports need an AI provider key (Claude, GPT, or Gemini). Add one to enable analysis.</p>
          </div>
        )}

        <BotStart recallReady={recallConfigured()} />

        <div className="card" style={{ marginTop: 16 }}>
          <p className="section-title" style={{ margin: "0 0 6px" }}>Recent sessions</p>
          {recent.length === 0 ? (
            <div className="empty"><Inbox /><div>No interview sessions yet. Start one above.</div></div>
          ) : (
            <table className="table">
              <thead><tr><th>Candidate / role</th><th>Source</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td><Link className="row-link" href={`/bot/${r.id}`}>{[r.candidateName, r.role].filter(Boolean).join(" · ") || "Session"}</Link></td>
                    <td className="muted">{r.platform || "—"}</td>
                    <td><span className="badge gray">{STATUS_LABEL[r.status] || r.status}</span></td>
                    <td className="muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
