// Thin Anthropic (Claude) client used by TrueHire's interview AI and Forge's coach.
export const AI_KEY = process.env.ANTHROPIC_API_KEY || "";
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function claude(system: string, messages: ChatMsg[], maxTokens = 1024): Promise<string> {
  if (!AI_KEY) throw new Error("no_ai_key");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": AI_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) throw new Error((await r.text()).slice(0, 240));
  const d = await r.json();
  return (d.content || []).map((c: any) => c.text || "").join("").trim();
}

export function extractJSON<T = any>(text: string): T | null {
  try { const m = text.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : text); } catch { return null; }
}
