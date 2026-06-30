import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AI_KEY } from "@/lib/ai";
import { PATTERNS, type PatternKey } from "@/lib/forge";
import Topbar from "@/components/Topbar";
import ForgeStart from "@/components/ForgeStart";
import CommitmentRow from "@/components/CommitmentRow";
import { Flame, Target, Inbox, Compass } from "@/components/icons";

export const dynamic = "force-dynamic";

const UNLOCK_SESSIONS = 3;
const UNLOCK_CONFIDENCE = 50;

export default async function ForgeHome() {
  const user = (await getCurrentUser())!;
  const [done, sessions, commitments] = await Promise.all([
    prisma.forgeSession.count({ where: { userId: user.id, status: "completed" } }),
    prisma.forgeSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.forgeCommitment.findMany({ where: { userId: user.id, status: { not: "done" } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const pattern = user.forgePattern && (PATTERNS as Record<string, typeof PATTERNS[PatternKey]>)[user.forgePattern];
  const unlocked = !!pattern && done >= UNLOCK_SESSIONS && user.forgeConfidence >= UNLOCK_CONFIDENCE;
  const need = Math.max(0, UNLOCK_SESSIONS - done);

  return (
    <>
      <Topbar title="Forge" crumb="Decision coach"
        right={<span className="pill"><Flame /> {done} session{done === 1 ? "" : "s"}</span>} />
      <div className="content">
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>The coach that won&apos;t let you hide</h2>
          <p>Forge isn&apos;t a chatbot that agrees with you. It finds the pattern keeping you stuck, names it, and holds you to one commitment at a time.</p>
        </div>

        <div className="forge-grid">
          <div className="forge-main">
            <ForgeStart disabled={!AI_KEY} />

            <div className="card" style={{ marginTop: 16 }}>
              <p className="section-title" style={{ margin: "0 0 4px" }}>Open commitments</p>
              {commitments.length === 0 ? (
                <div className="empty"><Compass /><div>Nothing open. Close a session with one concrete commitment and it shows up here.</div></div>
              ) : (
                <div className="commit-list">
                  {commitments.map((c) => (
                    <CommitmentRow key={c.id} id={c.id} text={c.text} deadline={c.deadline} status={c.status} />
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <p className="section-title" style={{ margin: 0 }}>Recent sessions</p>
              </div>
              {sessions.length === 0 ? (
                <div className="empty"><Inbox /><div>No sessions yet. Start one above.</div></div>
              ) : (
                <div className="session-list">
                  {sessions.map((s) => (
                    <Link key={s.id} href={`/forge/${s.id}`} className="session-item">
                      <div className="session-line">
                        <span className={`status-dot ${s.status}`} />
                        <span className="session-title">{s.decisionContext || "Untitled session"}</span>
                      </div>
                      <div className="session-meta">
                        {s.insight ? <span className="session-insight">{s.insight}</span> : <span className="muted">{s.status === "active" ? "In progress" : "Closed"}</span>}
                        <span className="muted">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="forge-side">
            <div className="card dna-card">
              <div className="dna-head"><Target /> <span className="section-title" style={{ margin: 0 }}>Thinking DNA</span></div>
              {unlocked && pattern ? (
                <>
                  <div className="dna-pattern">{pattern.label}</div>
                  <p className="dna-line">{pattern.line}</p>
                  <div className="conf-bar"><span style={{ width: `${user.forgeConfidence}%` }} /></div>
                  <p className="hint" style={{ marginTop: 6 }}>{user.forgeConfidence}% confidence · {done} sessions</p>
                  <Link className="btn btn-ghost btn-block" href="/forge/dna" style={{ marginTop: 12 }}>See full profile →</Link>
                </>
              ) : (
                <>
                  <div className="dna-locked">
                    <div className="dna-ring"><span style={{ "--p": `${Math.min(100, Math.round((done / UNLOCK_SESSIONS) * 100))}%` } as React.CSSProperties} /></div>
                    <p className="dna-line">Your pattern unlocks after {UNLOCK_SESSIONS} sessions. {need > 0 ? `${need} to go.` : "Almost there — keep going."}</p>
                  </div>
                  <p className="hint">Forge watches how you decide across sessions, then names the one pattern costing you the most.</p>
                </>
              )}
            </div>

            <div className="card forge-how">
              <p className="section-title" style={{ margin: "0 0 8px" }}>How it works</p>
              <ol className="how-list">
                <li><b>Name the loop.</b> Bring the decision you keep circling.</li>
                <li><b>Get confronted.</b> The coach goes at the real thing, not the surface.</li>
                <li><b>Commit.</b> Close with one concrete action and a date.</li>
                <li><b>Get held.</b> Miss it, and your next session opens there.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
