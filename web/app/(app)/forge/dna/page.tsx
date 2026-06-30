import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PATTERNS, type PatternKey } from "@/lib/forge";
import Topbar from "@/components/Topbar";
import { Target, Flame, Inbox } from "@/components/icons";

export const dynamic = "force-dynamic";

const UNLOCK_SESSIONS = 3;
const UNLOCK_CONFIDENCE = 50;

export default async function ForgeDNA() {
  const user = (await getCurrentUser())!;
  const [done, recentClosed] = await Promise.all([
    prisma.forgeSession.count({ where: { userId: user.id, status: "completed" } }),
    prisma.forgeSession.findMany({ where: { userId: user.id, status: "completed", pattern: { not: null } }, orderBy: { closedAt: "desc" }, take: 8 }),
  ]);
  const pattern = user.forgePattern && (PATTERNS as Record<string, typeof PATTERNS[PatternKey]>)[user.forgePattern];
  const unlocked = !!pattern && done >= UNLOCK_SESSIONS && user.forgeConfidence >= UNLOCK_CONFIDENCE;

  return (
    <>
      <Topbar title="Thinking DNA" crumb="Forge" />
      <div className="content" style={{ maxWidth: 880 }}>
        {unlocked && pattern ? (
          <>
            <div className="card dna-hero">
              <div className="dna-hero-top">
                <Target />
                <div>
                  <div className="crumb">Your dominant pattern</div>
                  <h2 style={{ margin: "2px 0 0" }}>{pattern.label}</h2>
                </div>
                <div className="dna-conf">
                  <div className="conf-num">{user.forgeConfidence}%</div>
                  <div className="hint">confidence</div>
                </div>
              </div>
              <p className="dna-hero-line">{pattern.line}</p>
            </div>

            <div className="dna-trio">
              <div className="card dna-facet strength">
                <div className="facet-h">Your strength</div>
                <p>{pattern.strength}</p>
              </div>
              <div className="card dna-facet shadow">
                <div className="facet-h">The shadow</div>
                <p>{pattern.shadow}</p>
              </div>
              <div className="card dna-facet shift">
                <div className="facet-h">The shift</div>
                <p>{pattern.shift}</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <p className="section-title" style={{ margin: "0 0 6px" }}>Where this showed up</p>
              {recentClosed.length === 0 ? (
                <div className="empty"><Inbox /><div>No classified sessions yet.</div></div>
              ) : (
                <div className="session-list">
                  {recentClosed.map((s) => (
                    <Link key={s.id} href={`/forge/${s.id}`} className="session-item">
                      <div className="session-line"><span className="session-title">{s.decisionContext || "Session"}</span></div>
                      {s.rationale && <div className="session-meta"><span className="session-insight">{s.rationale}</span></div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card dna-empty">
            <Target />
            <h2>Your Thinking DNA is still forming</h2>
            <p className="hint" style={{ maxWidth: 460, margin: "6px auto 0" }}>
              Forge needs at least {UNLOCK_SESSIONS}{" "}closed sessions to name your dominant pattern with confidence.
              You&apos;re at {done}. The more honestly you work, the sharper it gets.
            </p>
            <Link className="btn btn-primary" href="/forge" style={{ marginTop: 18 }}><Flame /> Start a session</Link>
          </div>
        )}
      </div>
    </>
  );
}
