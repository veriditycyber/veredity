import type { Verdict } from "@/lib/types";

const ICO: Record<string, string> = { ok: "✓", bad: "⚠", warn: "!", na: "–" };
const ICOC: Record<string, string> = { ok: "sig-ok", bad: "sig-bad", warn: "sig-warn", na: "sig-na" };

// Presentational verdict/report block — used by the live check flow and the
// stored history detail page. No hooks, so it works in server components too.
export default function VerdictCard({
  verdict, metaLeft, metaRight,
}: { verdict: Verdict; metaLeft?: string; metaRight?: string }) {
  const v = verdict;
  return (
    <div>
      <div className={`verdict ${v.band}`}>
        <div className={`dot ${v.band}`}>{v.band === "green" ? "✓" : v.band === "yellow" ? "!" : "✕"}</div>
        <div>
          <h2>{v.title}</h2>
          {v.sub && <div className="sub">{v.sub}</div>}
        </div>
        {v.score !== "" && (
          <div className="gauge">
            <div className="num">{v.score}</div>
            <div className="lbl">Risk / 100</div>
          </div>
        )}
      </div>

      <ul className="signals">
        {v.signals.map((x, i) => (
          <li key={i}>
            <span className={`sig-ico ${ICOC[x.s]}`}>{ICO[x.s]}</span>
            <span className="mono">{x.t}</span>
          </li>
        ))}
      </ul>

      {v.rec && <div className="recommend" dangerouslySetInnerHTML={{ __html: v.rec }} />}

      {(metaLeft || metaRight) && (
        <div className="meta">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      )}
    </div>
  );
}
