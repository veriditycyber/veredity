// Client-safe shared types (no server-only imports).
export type Band = "green" | "yellow" | "red";
export type Sig = { s: "ok" | "bad" | "warn" | "na"; t: string };
export type Verdict = {
  name: string;
  role: string;
  kind: string;
  band: Band;
  score: number | "";
  title: string;
  sub: string;
  signals: Sig[];
  rec: string;
  checkId?: string;
  scansLeft?: number;
};

export const BAND_TITLE: Record<Band, string> = {
  green: "Likely genuine",
  yellow: "Inconclusive — human review needed",
  red: "High risk — likely manipulated",
};
export const BAND_REC: Record<Band, string> = {
  green: "<b>Proceed.</b> Reality Defender found no elevated manipulation risk in this media.",
  yellow: "<b>Manual review advised.</b> The score is ambiguous — re-verify with a live, monitored check.",
  red: "<b>Escalate — do not advance.</b> Reality Defender flags likely manipulation. Require secondary identity verification.",
};
