import Topbar from "@/components/Topbar";
import ApiKeys from "@/components/ApiKeys";
import Webhooks from "@/components/Webhooks";
import { getCurrentUser } from "@/lib/auth";
import { apiMonthlyLimit, getApiUsage } from "@/lib/apiusage";

export const dynamic = "force-dynamic";

const CURL = `curl -X POST https://veridity.in/api/v1/trust \\
  -H "Authorization: Bearer thk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "candidateName": "Jane Doe",
    "email": "jane@company.com",
    "phone": "+14155552671",
    "claimedCountry": "US",
    "resumeText": "…optional…"
  }'`;

const RESP = `{
  "id": "…",
  "score": 92,
  "band": "green",
  "signals": [
    { "key": "email_disposable", "label": "Disposable email", "status": "ok", "detail": "…" },
    { "key": "location_match",  "label": "Location consistency", "status": "ok", "detail": "…" }
  ]
}`;

export default async function DevelopersPage() {
  const user = (await getCurrentUser())!;
  const [used, limit] = [await getApiUsage(user.id), apiMonthlyLimit(user.plan)];
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <>
      <Topbar title="Developers" crumb="Trust API" />
      <div className="content" style={{ maxWidth: 820 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Embed TrueHire anywhere</h2>
          <p>Score any candidate&apos;s trust from your own ATS, job board, or backend with a single API call. Keys authenticate as your account and land results in your dashboard.</p>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <p className="section-title" style={{ margin: 0 }}>API usage this month</p>
            <span className="hint"><b style={{ color: "var(--text)" }}>{used.toLocaleString()}</b> / {limit.toLocaleString()} calls</span>
          </div>
          <div className="ob-progress" style={{ marginBottom: 0 }}><span style={{ width: `${pct}%` }} /></div>
          <p className="hint" style={{ marginTop: 8 }}>Requests are rate-limited to {30}/10s per account; the monthly cap scales with your plan.</p>
        </div>

        <div className="card">
          <p className="section-title">API keys</p>
          <ApiKeys />
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <p className="section-title">Webhooks</p>
          <p className="hint" style={{ margin: "0 0 12px" }}>Get a signed POST to your systems when a candidate is scored, flagged high-risk, or a verification completes.</p>
          <Webhooks />
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <p className="section-title">Score a candidate</p>
          <p className="hint" style={{ marginBottom: 10 }}><span className="mono">POST /api/v1/trust</span> — authenticate with a Bearer key.</p>
          <pre className="transcript">{CURL}</pre>
          <p className="hint" style={{ margin: "14px 0 8px" }}>Response</p>
          <pre className="transcript">{RESP}</pre>
        </div>
      </div>
    </>
  );
}
