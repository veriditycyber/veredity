// AI passes for the Interview Bot: live notes, a scored report, and interview
// integrity (proxy / scripted / coaching signals read from the transcript).
import { complete, extractJSON } from "./ai";

export type IntegrityFlag = { label: string; status: "ok" | "warn" | "risk"; detail: string };

// Running notes the recruiter sees update live during the call.
export async function generateNotes(transcript: string, modelId?: string | null): Promise<string> {
  const t = transcript.trim();
  if (t.length < 60) return "";
  const sys = `You are a recruiter's live note-taker during a job interview. From the transcript so far, write concise running notes: what's been covered, notable answers, and open threads. Short lines, no fluff, max ~8 lines. Plain text.`;
  const { text } = await complete({ modelId, system: sys, messages: [{ role: "user", content: t.slice(-9000) }], maxTokens: 400 });
  return text.trim();
}

// Full scored report at the end of the call (mirrors the Interview AI scorecard).
export async function generateReport(transcript: string, candidate: string, role: string, modelId?: string | null) {
  const sys = `You are an expert, fair-minded interview analyst. Assess STRICTLY on demonstrated skills, reasoning, experience, and communication in the transcript. Do NOT use protected characteristics. If the transcript is thin, say so and lower confidence. You are decision-support, never the final decision. Respond with ONLY a JSON object.`;
  const prompt = `Interview for role "${role || "the role"}", candidate "${candidate || "the candidate"}". Return JSON:
{ "summary": string, "strengths": string[], "concerns": string[], "questions": string[],
  "recommendation": "Strong Yes"|"Yes"|"Maybe"|"No", "fitScore": number }

Transcript:
"""
${transcript.slice(0, 14000)}
"""`;
  const { text, model } = await complete({ modelId, system: sys, messages: [{ role: "user", content: prompt }], maxTokens: 1400 });
  const parsed = extractJSON<any>(text);
  return { parsed, model: model.label };
}

// Interview integrity — reads the transcript for signs the candidate isn't who /
// how they present (proxy answering, scripted/AI-read responses, coaching, evasion).
export async function analyzeIntegrity(transcript: string, modelId?: string | null): Promise<{ flags: IntegrityFlag[]; integrityScore: number } | null> {
  const t = transcript.trim();
  if (t.length < 120) return null;
  const sys = `You audit an interview transcript for INTEGRITY red flags — signals the candidate may be misrepresenting themselves. Look for: answers that sound read/scripted or AI-generated, a delay-then-fluent pattern (someone feeding answers), a second person prompting, evasive or inconsistent identity/location claims, refusal to enable video, background voices. Judge only from the text; be measured. Respond with ONLY JSON.`;
  const prompt = `Return JSON:
{ "flags": [ { "label": string, "status": "ok"|"warn"|"risk", "detail": string } ],
  "integrityScore": number  // 0-100, higher = more trustworthy }
Include 3-6 flags covering the most important signals (both reassuring and concerning).

Transcript:
"""
${t.slice(0, 12000)}
"""`;
  const { text } = await complete({ modelId, system: sys, messages: [{ role: "user", content: prompt }], maxTokens: 700 });
  const j = extractJSON<{ flags: IntegrityFlag[]; integrityScore: number }>(text);
  if (!j || !Array.isArray(j.flags)) return null;
  return { flags: j.flags.slice(0, 8), integrityScore: Math.max(0, Math.min(100, Math.round(j.integrityScore ?? 50))) };
}
