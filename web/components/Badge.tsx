import { Check, Alert } from "./icons";

export function BandBadge({ band, status }: { band?: string | null; status?: string | null }) {
  if (status === "ANALYZING") return <span className="badge gray">Analyzing…</span>;
  const b = band || "gray";
  const label = b === "green" ? "Genuine" : b === "yellow" ? "Review" : b === "red" ? "High risk" : "—";
  return (
    <span className={`badge ${b}`}>
      {b === "green" ? <Check /> : b === "red" ? <Alert /> : null}
      {label}
    </span>
  );
}
