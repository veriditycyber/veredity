// Forge — the confrontational founder coach. Reimplemented for Veridity on Claude.
// Faithful to the original's philosophy: detect the pattern keeping a founder stuck,
// confront avoidance, hold commitments, never validate.
import { claude, extractJSON } from "./ai";

export type PatternKey = "approval_seeker" | "comfort_hoarder" | "shiny_chaser" | "conversation_avoider" | "perfectionist_bottleneck";

export const PATTERNS: Record<PatternKey, { label: string; line: string; strength: string; shadow: string; shift: string }> = {
  approval_seeker: {
    label: "The Approval Seeker",
    line: "You look for permission before you act — usually from someone who can't give you certainty.",
    strength: "You build consensus and people trust you.",
    shadow: "You've already decided; you're just collecting permission to feel safe.",
    shift: "Name the decision you've already made, then act before you ask one more person.",
  },
  comfort_hoarder: {
    label: "The Comfort Hoarder",
    line: "You protect what's stable and call it being responsible.",
    strength: "You don't blow up what's working on a whim.",
    shadow: "You confuse avoiding loss with making progress. Safety becomes the cage.",
    shift: "Name the bet you're avoiding and take the smallest reversible version this week.",
  },
  shiny_chaser: {
    label: "The Shiny Chaser",
    line: "You start with fire and stall before the finish line.",
    strength: "You see opportunity everywhere and move fast.",
    shadow: "The new idea is an escape hatch from the boring, hard last 20%.",
    shift: "Finish one open loop before you open the next. Name it.",
  },
  conversation_avoider: {
    label: "The Conversation Avoider",
    line: "The thing you keep circling isn't the decision — it's the conversation you won't have.",
    strength: "You're considerate and you keep the peace.",
    shadow: "Avoided conversations compound into the exact mess you fear.",
    shift: "Name the person and the sentence you've been dodging. Say it by a date.",
  },
  perfectionist_bottleneck: {
    label: "The Perfectionist Bottleneck",
    line: "You gate everything through yourself in the name of quality.",
    strength: "Your standards are real and people feel them.",
    shadow: "You've become the bottleneck and called it craftsmanship.",
    shift: "Name one thing only you 'can' do, and hand it off this week — B+ is fine.",
  },
};

export type Mode = "insight" | "accountability" | "confrontation" | "exploration";
export const MODE_BLOCK: Record<Mode, string> = {
  insight: "MODE: Insight. Lead with curiosity. Surface the pattern under the decision. Build toward one concrete commitment.",
  accountability: "MODE: Accountability. They missed their last commitment. Name what got in the way before moving on. Don't let it slide.",
  confrontation: "MODE: Confrontation. Multiple misses. Name the gap directly and without cushioning. Demand a smaller, more specific commitment.",
  exploration: "MODE: Exploration. They keep circling the same category. Go to the belief underneath it. This is not accountability — dig.",
};

// Choose the coach mode from recent commitment follow-through (deterministic, like the original).
export function selectMode(recent: { status: string }[]): Mode {
  let consecutiveMissed = 0;
  for (const c of recent) { if (c.status === "not_done") consecutiveMissed++; else break; }
  if (consecutiveMissed >= 2) return "confrontation";
  if (consecutiveMissed === 1) return "accountability";
  return "insight";
}

const AVOID = [
  /\bi'?ll (think|figure|sort)\b/i, /still figuring/i, /not (yet|ready)\b/i, /the right time/i,
  /maybe (later|after)/i, /it'?s (complicated|complex)/i, /need more (data|info)/i,
  /could go either way/i, /on the fence/i, /once things settle/i, /\bbut (what|how about)\b/i,
  /market isn'?t ready/i,
];
export function detectAvoidance(text: string): boolean {
  return AVOID.filter((re) => re.test(text)).length >= 1;
}

const VOICE = `You are Forge, a confrontational coach for founders. You do not comfort, reassure, or validate.
HARD RULES:
- Never say "I understand", "that makes sense", or "great question".
- Never use bullet points or lists. Never name a framework, model, theory, or principle.
- Keep replies to at most 3 sentences. End EVERY reply with exactly one sharp question.
- Don't open with a greeting or "so you're...". Sound like a blunt, perceptive human coach, not a therapist.
- Confront avoidance directly. Go after the real decision, not the surface one.
- Hold them to anything they've committed to.`;

export function buildCoachSystem(opts: {
  name?: string | null;
  pattern?: string | null;
  mode: Mode;
  lastCommitment?: { text: string; status: string } | null;
}): string {
  const p = opts.pattern && (PATTERNS as any)[opts.pattern];
  const parts = [VOICE, MODE_BLOCK[opts.mode]];
  if (p) parts.push(`KNOWN PATTERN: ${p.label} — ${p.line} Watch for it and name it when it shows up.`);
  if (opts.lastCommitment) parts.push(`LAST COMMITMENT (verbatim): "${opts.lastCommitment.text}" — status: ${opts.lastCommitment.status}. If they didn't do it, that's the first thing.`);
  parts.push(`The founder's name is ${opts.name || "the founder"}.`);
  return parts.join("\n\n");
}

// Classify the dominant pattern from a session's messages.
export async function classifyPattern(messages: { role: string; content: string }[], modelId?: string | null): Promise<{ pattern: PatternKey; rationale: string; confidence: number } | null> {
  const convo = messages.map((m) => `${m.role === "user" ? "FOUNDER" : "COACH"}: ${m.content}`).join("\n").slice(0, 8000);
  const sys = `You classify a founder's dominant decision-making pattern from a coaching conversation. Respond with ONLY JSON.`;
  const prompt = `Pattern options:
- approval_seeker: seeks permission/validation before acting
- comfort_hoarder: risk-averse, protects stability, avoids loss
- shiny_chaser: starts new things, avoids finishing
- conversation_avoider: delays hard conversations
- perfectionist_bottleneck: gates everything through themselves

From this conversation, return JSON: { "pattern": one of the keys, "rationale": one evidence-based sentence, "confidence": 0-100 }

Conversation:
"""
${convo}
"""`;
  const out = await claude(sys, [{ role: "user", content: prompt }], 400, modelId).catch(() => "");
  const j = extractJSON<{ pattern: PatternKey; rationale: string; confidence: number }>(out);
  if (!j || !(PATTERNS as any)[j.pattern]) return null;
  return { pattern: j.pattern, rationale: j.rationale || "", confidence: Math.max(0, Math.min(100, Math.round(j.confidence ?? 50))) };
}

// One-sentence session insight.
export async function generateInsight(messages: { role: string; content: string }[], modelId?: string | null): Promise<string> {
  if (messages.length < 4) return "";
  const convo = messages.slice(-14).map((m) => `${m.role === "user" ? "FOUNDER" : "COACH"}: ${m.content}`).join("\n").slice(0, 6000);
  const sys = `Write one sharp, specific sentence a sharp coach would observe after this session. No quotes, no preamble. It should name the real thing under the surface.`;
  const out = await claude(sys, [{ role: "user", content: convo }], 150, modelId).catch(() => "");
  return out.replace(/^["']|["']$/g, "").trim();
}
