import { MAX_MONTHLY_SCANS } from "./rd";

export type Plan = "free" | "pro" | "business";

export const PLANS: Record<Plan, { name: string; price: string; per: string; scans: number; ai: number; features: string[] }> = {
  free: {
    name: "Free", price: "₹0", per: "forever", scans: 10, ai: 5,
    features: ["10 candidate deepfake checks / mo", "5 AI interview analyses / mo", "Forge decision coach", "Candidate verification links", "Audit trail + CSV export"],
  },
  pro: {
    name: "Pro", price: "₹3,999", per: "/ month", scans: 200, ai: 100,
    features: ["200 candidate checks / mo", "100 AI analyses / mo", "All AI models (Claude, GPT, Gemini)", "Everything in Free", "Priority email support"],
  },
  business: {
    name: "Business", price: "₹15,999", per: "/ month", scans: 1000, ai: 500,
    features: ["1,000 candidate checks / mo", "500 AI analyses / mo", "Everything in Pro", "Team seats (soon)", "SSO & SAML (soon)"],
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

// Razorpay Plan IDs come from env (created once in the Razorpay dashboard).
const RZP_PLAN_ENV: Record<Exclude<Plan, "free">, string> = {
  pro: "RAZORPAY_PLAN_PRO",
  business: "RAZORPAY_PLAN_BUSINESS",
};
export function razorpayPlanId(plan: Plan): string | null {
  if (plan === "free") return null;
  return process.env[RZP_PLAN_ENV[plan]] || null;
}

// Stripe Price IDs (created once in the Stripe dashboard) — international cards.
const STRIPE_PRICE_ENV: Record<Exclude<Plan, "free">, string> = {
  pro: "STRIPE_PRICE_PRO",
  business: "STRIPE_PRICE_BUSINESS",
};
export function stripePriceId(plan: Plan): string | null {
  if (plan === "free") return null;
  return process.env[STRIPE_PRICE_ENV[plan]] || null;
}

// USD display prices for the Stripe (international) path.
export const USD_PRICE: Record<Plan, string> = { free: "$0", pro: "$49", business: "$199" };
