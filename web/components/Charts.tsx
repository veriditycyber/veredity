// Presentational monochrome charts (pure SVG, no client JS needed).

export function ActivityChart({ data }: { data: { label: string; count: number; flagged: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 100, H = 42, n = data.length, gap = 2;
  const bw = (W - gap * (n - 1)) / n;
  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} preserveAspectRatio="none" style={{ width: "100%", height: 120 }} role="img" aria-label="Checks over the last 14 days">
      {data.map((d, i) => {
        const x = i * (bw + gap);
        const h = (d.count / max) * H;
        const fh = (d.flagged / max) * H;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={Math.max(h, d.count ? 1 : 0)} rx="0.8" fill="var(--line2)" />
            {d.flagged > 0 && <rect x={x} y={H - fh} width={bw} height={Math.max(fh, 1)} rx="0.8" fill="var(--danger)" />}
          </g>
        );
      })}
      <line x1="0" y1={H} x2={W} y2={H} stroke="var(--line)" strokeWidth="0.4" />
    </svg>
  );
}

export function RiskDonut({ green, yellow, red }: { green: number; yellow: number; red: number }) {
  const total = green + yellow + red;
  const r = 42, C = 2 * Math.PI * r;
  const segs = [
    { v: green, color: "var(--text)" },
    { v: yellow, color: "var(--muted)" },
    { v: red, color: "var(--danger)" },
  ];
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <svg viewBox="0 0 110 110" style={{ width: 110, height: 110, flex: "none" }} role="img" aria-label="Risk breakdown">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--line)" strokeWidth="11" />
        {total > 0 && segs.map((s, i) => {
          const len = (s.v / total) * C;
          const el = (
            <circle key={i} cx="55" cy="55" r={r} fill="none" stroke={s.color} strokeWidth="11"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 55 55)" strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
        <text x="55" y="52" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fontWeight="700" fill="var(--text)">{total}</text>
        <text x="55" y="68" textAnchor="middle" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">CHECKS</text>
      </svg>
      <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
        <Legend dot="var(--text)" label="Genuine" v={green} />
        <Legend dot="var(--muted)" label="Review" v={yellow} />
        <Legend dot="var(--danger)" label="High risk" v={red} />
      </div>
    </div>
  );
}

function Legend({ dot, label, v }: { dot: string; label: string; v: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: dot, flex: "none" }} />
      <span style={{ color: "var(--muted)", minWidth: 72 }}>{label}</span>
      <b style={{ fontFamily: "var(--font-display)" }}>{v}</b>
    </span>
  );
}
