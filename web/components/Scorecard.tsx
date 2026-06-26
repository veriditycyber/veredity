import { Check, Alert } from "./icons";

type Analysis = {
  summary?: string;
  strengths?: string[];
  concerns?: string[];
  questions?: string[];
  recommendation?: string;
  fitScore?: number | null;
};

export default function Scorecard({ a, meta }: { a: Analysis; meta?: string }) {
  const rec = a.recommendation || "—";
  const band = rec === "Strong Yes" || rec === "Yes" ? "green" : rec === "No" ? "red" : "yellow";
  return (
    <div>
      <div className="sc-head">
        <div className="sc-gauge">
          <div className="sc-score">{a.fitScore ?? "—"}</div>
          <div className="sc-lbl">FIT / 100</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className={`badge ${band}`}>{rec}</span>
          {a.summary && <p className="sc-summary">{a.summary}</p>}
        </div>
      </div>

      <div className="sc-grid">
        <div>
          <p className="section-title">Strengths</p>
          <ul className="sc-list">
            {(a.strengths || []).map((s, i) => <li key={i}><span className="sig-ok"><Check /></span><span>{s}</span></li>)}
          </ul>
        </div>
        <div>
          <p className="section-title">Concerns to probe</p>
          <ul className="sc-list">
            {(a.concerns || []).map((s, i) => <li key={i}><span className="sig-bad"><Alert /></span><span>{s}</span></li>)}
          </ul>
        </div>
      </div>

      {a.questions && a.questions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="section-title">Suggested follow-up questions</p>
          <ol className="sc-qlist">{a.questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </div>
      )}

      <div className="meta" style={{ marginTop: 16 }}>
        <span>{meta || ""}</span>
        <span>AI decision support — a human makes the final call.</span>
      </div>
    </div>
  );
}
