// Candidate Trust Score — fuses cheap, high-signal metadata checks with the
// deepfake verdict and (optional) résumé analysis into one score + reasons.
// Everything here works without paid APIs; AI résumé analysis reuses lib/ai.
import dns from "node:dns/promises";
import disposableList from "disposable-email-domains";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { complete, extractJSON } from "./ai";

const DISPOSABLE = new Set<string>(disposableList as string[]);
const FREE_PROVIDERS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com",
  "icloud.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "mail.com",
  "yandex.com", "zoho.com", "live.com", "msn.com", "rediffmail.com",
]);

export type SignalStatus = "ok" | "warn" | "risk";
export type Signal = { key: string; label: string; status: SignalStatus; detail: string; weight: number };

export type TrustInput = {
  candidateName?: string;
  email?: string;
  phone?: string;
  claimedCountry?: string; // ISO-2
  resumeText?: string;
  checkBand?: string | null; // linked deepfake Check band
  model?: string | null;
};

export type TrustResult = { score: number; band: "green" | "yellow" | "red"; signals: Signal[]; resumeFlag?: string; model?: string };

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

async function analyzeEmail(email: string): Promise<Signal[]> {
  const e = email.trim().toLowerCase();
  const sigs: Signal[] = [];
  const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(e);
  if (!m) {
    sigs.push({ key: "email_format", label: "Email format", status: "risk", detail: "Not a valid email address.", weight: 12 });
    return sigs;
  }
  const domain = m[1];
  sigs.push({ key: "email_format", label: "Email format", status: "ok", detail: "Well-formed address.", weight: 12 });

  if (DISPOSABLE.has(domain)) {
    sigs.push({ key: "email_disposable", label: "Disposable email", status: "risk", detail: `${domain} is a known throwaway/temporary email domain.`, weight: 30 });
  } else {
    sigs.push({ key: "email_disposable", label: "Disposable email", status: "ok", detail: "Not a known throwaway domain.", weight: 30 });
  }

  if (FREE_PROVIDERS.has(domain)) {
    sigs.push({ key: "email_type", label: "Email type", status: "warn", detail: `Free consumer provider (${domain}). Corporate email is stronger for hiring.`, weight: 8 });
  } else {
    sigs.push({ key: "email_type", label: "Email type", status: "ok", detail: `Custom / corporate domain (${domain}).`, weight: 8 });
  }

  // Domain must be able to receive mail (MX records) — a fake/parked domain often can't.
  try {
    const mx = await withTimeout(dns.resolveMx(domain), 3500);
    if (mx && mx.length > 0) sigs.push({ key: "email_mx", label: "Domain deliverability", status: "ok", detail: "Domain has valid mail servers.", weight: 15 });
    else sigs.push({ key: "email_mx", label: "Domain deliverability", status: "risk", detail: "No mail servers found — domain can't receive email.", weight: 15 });
  } catch {
    sigs.push({ key: "email_mx", label: "Domain deliverability", status: "warn", detail: "Couldn't confirm mail servers for this domain.", weight: 15 });
  }
  return sigs;
}

function analyzePhone(phone: string, claimedCountry?: string): { sigs: Signal[]; phoneCountry?: string } {
  const sigs: Signal[] = [];
  const parsed = parsePhoneNumberFromString(phone.trim(), (claimedCountry as any) || undefined);
  if (!parsed || !parsed.isValid()) {
    sigs.push({ key: "phone_valid", label: "Phone number", status: "risk", detail: "Not a valid phone number.", weight: 15 });
    return { sigs };
  }
  sigs.push({ key: "phone_valid", label: "Phone number", status: "ok", detail: `Valid ${parsed.country || ""} number.`, weight: 15 });

  const type = parsed.getType();
  if (type === "VOIP") {
    sigs.push({ key: "phone_type", label: "Line type", status: "warn", detail: "VoIP / virtual number — common in impersonation.", weight: 10 });
  }
  return { sigs, phoneCountry: parsed.country };
}

function analyzeLocation(claimedCountry?: string, phoneCountry?: string): Signal[] {
  if (!claimedCountry || !phoneCountry) return [];
  if (claimedCountry.toUpperCase() === phoneCountry.toUpperCase()) {
    return [{ key: "location_match", label: "Location consistency", status: "ok", detail: `Phone country (${phoneCountry}) matches the claimed location.`, weight: 25 }];
  }
  return [{ key: "location_match", label: "Location consistency", status: "risk", detail: `Phone is registered in ${phoneCountry} but the candidate claims ${claimedCountry.toUpperCase()} — a classic remote-hiring fraud signal.`, weight: 25 }];
}

function analyzeCheck(band?: string | null): Signal[] {
  if (!band) return [];
  if (band === "red") return [{ key: "deepfake", label: "Deepfake check", status: "risk", detail: "Linked media flagged as likely synthetic.", weight: 30 }];
  if (band === "yellow") return [{ key: "deepfake", label: "Deepfake check", status: "warn", detail: "Linked media was inconclusive.", weight: 30 }];
  return [{ key: "deepfake", label: "Deepfake check", status: "ok", detail: "Linked media passed the deepfake check.", weight: 30 }];
}

async function analyzeResume(resumeText: string, modelId?: string | null): Promise<{ sig: Signal; verdict: string; model?: string }> {
  const sys = `You detect fabricated or AI-generated résumés for a recruiter. Respond ONLY with a JSON object.`;
  const prompt = `Assess this résumé for authenticity signals. Return JSON:
{ "aiGenerated": number (0-100 likelihood it is AI-generated / templated boilerplate),
  "redFlags": string[] (specific concrete concerns: impossible timelines, vague generic claims, inconsistencies, buzzword stuffing),
  "verdict": string (one short sentence) }

Résumé:
"""
${resumeText.slice(0, 8000)}
"""`;
  try {
    const { text, model } = await complete({ modelId, system: sys, messages: [{ role: "user", content: prompt }], maxTokens: 600 });
    const j = extractJSON<{ aiGenerated: number; redFlags: string[]; verdict: string }>(text);
    if (!j) throw new Error("parse");
    const ai = Math.max(0, Math.min(100, Math.round(j.aiGenerated ?? 0)));
    const status: SignalStatus = ai >= 70 ? "risk" : ai >= 40 ? "warn" : "ok";
    const detail = [j.verdict, (j.redFlags || []).slice(0, 3).join("; ")].filter(Boolean).join(" — ").slice(0, 300) || "Analyzed.";
    return { sig: { key: "resume", label: "Résumé authenticity", status, detail, weight: 20 }, verdict: j.verdict || detail, model: model.label };
  } catch {
    return { sig: { key: "resume", label: "Résumé authenticity", status: "warn", detail: "Could not analyze the résumé text.", weight: 20 }, verdict: "" };
  }
}

const PENALTY: Record<SignalStatus, number> = { ok: 0, warn: 0.5, risk: 1 };

export async function computeTrust(input: TrustInput): Promise<TrustResult> {
  const signals: Signal[] = [];
  let resumeFlag: string | undefined;
  let model: string | undefined;

  if (input.email) signals.push(...(await analyzeEmail(input.email)));

  let phoneCountry: string | undefined;
  if (input.phone) { const r = analyzePhone(input.phone, input.claimedCountry); signals.push(...r.sigs); phoneCountry = r.phoneCountry; }

  signals.push(...analyzeLocation(input.claimedCountry, phoneCountry));
  signals.push(...analyzeCheck(input.checkBand));

  if (input.resumeText && input.resumeText.trim().length > 80) {
    const r = await analyzeResume(input.resumeText, input.model);
    signals.push(r.sig); resumeFlag = r.verdict; model = r.model;
  }

  // Weighted penalty model: start at 100, subtract weighted penalties.
  const totalWeight = signals.reduce((s, x) => s + x.weight, 0) || 1;
  const penalty = signals.reduce((s, x) => s + x.weight * PENALTY[x.status], 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - (penalty / totalWeight) * 100)));

  // Band from score, then hard-risk override: multiple independent risk signals
  // mean high risk regardless of how many "ok" signals dilute the average.
  const riskCount = signals.filter((s) => s.status === "risk").length;
  let band: TrustResult["band"] = score >= 70 ? "green" : score >= 40 ? "yellow" : "red";
  if (riskCount >= 2) band = "red";
  else if (riskCount === 1 && band === "green") band = "yellow";

  return { score, band, signals, resumeFlag, model };
}
