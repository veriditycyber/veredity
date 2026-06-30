import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo, LogoMark } from "@/components/Logo";
import { Shield, Lock, Check, Scan, Clock, Person, Flame, Audio, Grid } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import MatrixRain from "@/components/MatrixRain";
import CursorGlow from "@/components/CursorGlow";
import RealityLens from "@/components/RealityLens";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const user = await getCurrentUser();

  return (
    <>
      <CursorGlow />
      {/* NAV */}
      <header className="lp-nav">
        <div className="lp-nav-in">
          <Logo size={30} />
          <nav className="lp-nav-links">
            <a href="#products">Products</a>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#trust">Security</a>
          </nav>
          <div className="lp-nav-cta">
            <ThemeToggle />
            {user ? (
              <Link className="btn btn-primary" href="/dashboard">Go to dashboard</Link>
            ) : (
              <>
                <Link className="btn btn-ghost" href="/login">Sign in</Link>
                <Link className="btn btn-primary" href="/signup">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="lp">
        {/* HERO */}
        <section className="hero">
          <span className="eyebrow anim-in d1"><Shield /> TrueHire — deepfake detection for hiring</span>
          <h1 className="anim-in d2">Know who you&apos;re<br /><span className="grad">really hiring.</span></h1>
          <p className="lead anim-in d3">
            Remote hiring has a new threat: deepfake candidates, impersonators, and AI-fronted identities.
            Veridity flags them in seconds — before you make an offer.
          </p>
          <div className="hero-cta anim-in d4">
            <Link className="btn btn-primary btn-lg" href="/signup">Start verifying free</Link>
            <Link className="btn btn-lg" href="/login">Sign in</Link>
          </div>
          <div className="trust-strip anim-in d5">
            <span><Lock /> Encrypted · no media stored</span>
            <span><Check /> Consent-first · BIPA-aware</span>
            <span><Shield /> Powered by Reality Defender</span>
          </div>
        </section>

        {/* STAT BAND */}
        <section className="stat-band reveal">
          <div className="sb">
            <div className="big">1 in 4</div>
            <div className="cap">of candidate profiles could be fake by 2028</div>
            <div className="src">Gartner, 2025</div>
          </div>
          <div className="sb">
            <div className="big">300+</div>
            <div className="cap">US companies hit by the North-Korean fake-IT-worker scheme</div>
            <div className="src">US DOJ, 2024</div>
          </div>
          <div className="sb">
            <div className="big">50×</div>
            <div className="cap">rise in AI face-spoofing attempts in hiring in a single year</div>
            <div className="src">Persona, 2024</div>
          </div>
        </section>
      </div>

      {/* MATRIX — THE THREAT */}
      <section className="matrix-band">
        <MatrixRain className="matrix-canvas" />
        <div className="matrix-overlay">
          <span className="m-kicker">// THE THREAT</span>
          <h2 className="glitch" data-text="Anyone can fake a face now.">Anyone can fake a face now.</h2>
          <p>A convincing deepfake takes seconds to make. Veridity reads the pixel-level signals a human eye can&apos;t — and tells you what&apos;s real.</p>
          <Link className="btn btn-primary btn-lg" href="/signup">See it catch a fake</Link>
        </div>
      </section>

      <div className="lp">
        {/* THE REALITY LENS — interactive */}
        <section className="lp-section reveal" id="see">
          <div className="lens-wrap">
            <div>
              <span className="kicker">The Veridity lens</span>
              <h2>See what a human can&apos;t.</h2>
              <p>To you, it&apos;s an ordinary candidate. Veridity maps a thousand facial signals per frame and surfaces the synthetic ones a human eye slides right past — the warped jawline, the lip-sync drift, the face-swap seams.</p>
              <p className="hint" style={{ marginTop: 16 }}>↗ Move your cursor across the candidate to scan.</p>
            </div>
            <RealityLens />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="lp-section reveal" id="how">
          <div className="head">
            <span className="kicker">How it works</span>
            <h2>Verify a candidate in three steps</h2>
            <p>No new tools to learn. Upload, analyze, decide — with a full audit trail kept for you.</p>
          </div>
          <div className="steps3">
            <div className="step">
              <div className="no">1</div>
              <h3>Upload the candidate</h3>
              <p>Drop in a photo, interview frame, or voice clip — and confirm the candidate&apos;s consent.</p>
            </div>
            <div className="step">
              <div className="no">2</div>
              <h3>AI checks for fakes</h3>
              <p>Multi-modal detection scans for face-swaps, morphing, injection, and synthetic-voice markers.</p>
            </div>
            <div className="step">
              <div className="no">3</div>
              <h3>Get a clear verdict</h3>
              <p>A green / yellow / red risk score with evidence — and a report saved to your audit trail.</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-section reveal" id="features">
          <div className="head">
            <span className="kicker">Why Veridity</span>
            <h2>Built for trust, not just detection</h2>
            <p>Detection is table stakes. Veridity wraps it in the workflow and compliance layer regulated teams actually need.</p>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <div className="ic"><Scan /></div>
              <div><h3>Multi-modal detection</h3><p>Face-swap, morphing, and synthetic-voice analysis in one check — not a single brittle signal.</p></div>
            </div>
            <div className="feat">
              <div className="ic"><Clock /></div>
              <div><h3>Compliance-grade audit trail</h3><p>Every check is stored and exportable as a report — the paper trail your risk team needs.</p></div>
            </div>
            <div className="feat">
              <div className="ic"><Check /></div>
              <div><h3>Consent-first &amp; BIPA-aware</h3><p>Explicit consent is required before every biometric check, built into the flow by design.</p></div>
            </div>
            <div className="feat">
              <div className="ic"><Person /></div>
              <div><h3>Human-in-the-loop</h3><p>Veridity is a fraud signal, never an automated hiring decision. Your recruiter always decides.</p></div>
            </div>
          </div>
        </section>

        {/* PRODUCTS — the Veridity platform */}
        <section className="lp-section reveal" id="products">
          <div className="head">
            <span className="kicker">The Veridity platform</span>
            <h2>One company. A suite of truth tools.</h2>
            <p>Veridity builds AI that tells you the truth — about who you&apos;re hiring, the decisions you&apos;re avoiding, and the systems you&apos;re trusting. Two products live today, more on the way.</p>
          </div>
          <div className="prod-grid">
            <div className="prod live">
              <div className="prod-top"><span className="prod-ic"><Shield /></span><span className="prod-tag">Live</span></div>
              <h3>TrueHire</h3>
              <p>Deepfake &amp; identity verification for remote hiring. Catch impersonators and AI-fronted candidates before you make an offer.</p>
              <Link className="prod-link" href="/signup">Start verifying →</Link>
            </div>
            <div className="prod live">
              <div className="prod-top"><span className="prod-ic"><Flame /></span><span className="prod-tag">Live</span></div>
              <h3>Forge</h3>
              <p>A confrontational AI coach for founders. It finds the pattern keeping you stuck, names it, and holds you to one commitment at a time.</p>
              <Link className="prod-link" href="/forge">Meet your coach →</Link>
            </div>
            <div className="prod">
              <div className="prod-top"><span className="prod-ic"><Audio /></span><span className="prod-tag soon">Soon</span></div>
              <h3>VoiceShield</h3>
              <p>Real-time synthetic-voice defense for call centers and support lines — flagging cloned voices mid-call.</p>
              <span className="prod-link dim">In development</span>
            </div>
            <div className="prod">
              <div className="prod-top"><span className="prod-ic"><Grid /></span><span className="prod-tag soon">Soon</span></div>
              <h3>AgentGuard</h3>
              <p>Security and guardrails for autonomous AI agents — so the agents acting on your behalf can be trusted.</p>
              <span className="prod-link dim">In development</span>
            </div>
          </div>
        </section>

        {/* TRUST / SECURITY */}
        <section className="lp-section reveal" id="trust">
          <div className="head">
            <span className="kicker">Security</span>
            <h2>Your data, handled with care</h2>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <div className="ic"><Lock /></div>
              <div><h3>Encrypted by default</h3><p>Encrypted sessions, hashed credentials, and secrets that never touch the browser.</p></div>
            </div>
            <div className="feat">
              <div className="ic"><Shield /></div>
              <div><h3>No media kept</h3><p>Uploaded media is sent to the detection engine and deleted immediately — never stored at rest.</p></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "20px 0 8px" }}>
          <div className="cta-band reveal">
            <h2>Stop guessing who&apos;s on the other side</h2>
            <p>Run your first candidate check in under two minutes. Free to start.</p>
            <Link className="btn btn-primary btn-lg" href="/signup">Get started free</Link>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="lp-foot">
        <div className="lp-foot-in">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={26} />
            <small>© 2026 Veridity · veridity.in · AI that tells you the truth<br />TrueHire &amp; Forge are Veridity products. TrueHire is a fraud-risk signal, not an automated hiring decision.</small>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <Link className="hint" href="/login" style={{ color: "var(--muted)" }}>Sign in</Link>
            <Link className="hint" href="/signup" style={{ color: "var(--muted)" }}>Get started</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
