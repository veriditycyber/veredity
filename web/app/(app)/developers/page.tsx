import Topbar from "@/components/Topbar";
import ApiKeys from "@/components/ApiKeys";
import { getCurrentUser } from "@/lib/auth";

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
  await getCurrentUser();
  return (
    <>
      <Topbar title="Developers" crumb="Trust API" />
      <div className="content" style={{ maxWidth: 820 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Embed TrueHire anywhere</h2>
          <p>Score any candidate&apos;s trust from your own ATS, job board, or backend with a single API call. Keys authenticate as your account and land results in your dashboard.</p>
        </div>

        <div className="card">
          <p className="section-title">API keys</p>
          <ApiKeys />
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
