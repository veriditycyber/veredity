import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { complete, anyProviderConfigured, extractJSON, AIError } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are an expert, fair-minded interview analyst helping a recruiter assess a candidate.
Base your assessment STRICTLY on demonstrated skills, reasoning, experience, and communication shown in the transcript.
Do NOT infer or use protected characteristics (race, gender, age, nationality, religion, disability, etc.). If the transcript is thin, say so and lower confidence rather than guessing.
You are a decision-support tool: surface evidence, never make the final hiring decision.
Respond with ONLY a single valid JSON object, no prose, no markdown fences.`;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!anyProviderConfigured()) {
    return NextResponse.json({ error: "no_ai_key", message: "AI is not configured. Add a provider key (e.g. ANTHROPIC_API_KEY) to enable interview analysis." }, { status: 503 });
  }

  const { transcript, candidateName, role, model } = await req.json().catch(() => ({}));
  const t = (transcript || "").toString().trim();
  if (t.length < 40) {
    return NextResponse.json({ error: "too_short", message: "Paste a longer transcript or set of notes (a few sentences minimum)." }, { status: 400 });
  }

  const prompt = `Analyze this interview for the role of "${role || "the role"}" and candidate "${candidateName || "the candidate"}".

Return a JSON object with exactly these keys:
{
  "summary": string,            // 2-3 sentence neutral summary of how the interview went
  "strengths": string[],        // 3-5 specific, evidence-based strengths
  "concerns": string[],         // 2-4 specific risks or gaps to probe
  "questions": string[],        // 3-5 sharp follow-up questions to ask next
  "recommendation": "Strong Yes" | "Yes" | "Maybe" | "No",
  "fitScore": number            // 0-100 overall fit for the role, evidence-based
}

Transcript / notes:
"""
${t.slice(0, 12000)}
"""`;

  try {
    const { text, model: used } = await complete({ modelId: model || user.aiModel, system: SYSTEM, messages: [{ role: "user", content: prompt }], maxTokens: 1400 });
    const parsed: any = extractJSON(text);
    if (!parsed) return NextResponse.json({ error: "parse", message: "Could not parse the AI response." }, { status: 502 });

    const iv = await prisma.interview.create({
      data: {
        userId: user.id,
        candidateName: candidateName || null,
        role: role || null,
        transcript: t.slice(0, 20000),
        summary: parsed.summary || null,
        strengths: JSON.stringify(parsed.strengths || []),
        concerns: JSON.stringify(parsed.concerns || []),
        questions: JSON.stringify(parsed.questions || []),
        recommendation: parsed.recommendation || null,
        fitScore: typeof parsed.fitScore === "number" ? Math.max(0, Math.min(100, Math.round(parsed.fitScore))) : null,
        model: used.label,
      },
    });
    return NextResponse.json({ id: iv.id, model: used.label, ...parsed });
  } catch (err: any) {
    if (err instanceof AIError) return NextResponse.json({ error: err.code, message: err.message }, { status: err.code === "no_ai_key" ? 503 : 502 });
    return NextResponse.json({ error: "error", message: err?.message || String(err) }, { status: 500 });
  }
}
