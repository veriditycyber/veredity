import { MAX_MONTHLY_SCANS } from "./rd";

export type Plan = "free" | "pro" | "business";

export const PLANS: Record<Plan, { name: string; price: string; per: string; scans: number; ai: number; features: string[] }> = {
  free: {
    name: "Free", price: "$0", per: "forever", scans: 10, ai: 5,
    features: ["10 candidate deepfake checks / mo", "5 AI interview analyses / mo", "Candidate verification links", "Audit trail + CSV export"],
  },
  pro: {
    name: "Pro", price: "$49", per: "/ month", scans: 200, ai: 100,
    features: ["200 candidate checks / mo", "100 AI interview analyses / mo", "Everything in Free", "Priority email support"],
  },
  business: {
    name: "Business", price: "$199", per: "/ month", scans: 1000, ai: 500,
    features: ["1,000 candidate checks / mo", "500 AI interview analyses / mo", "Everything in Pro", "Team seats (soon)", "SSO & SAML (soon)"],
  },
};

export function planOf(p: string | null | undefined): Plan {
  return p === "pro" || p === "business" ? p : "free";
}
// Product allowance, capped by the detection backend's hard limit.
export function effectiveScanLimit(plan: string | null | undefined): number {
  return Math.min(PLANS[planOf(plan)].scans, MAX_MONTHLY_SCANS);
}
export function aiLimit(plan: string | null | undefined): number {
  return PLANS[planOf(plan)].ai;
}
