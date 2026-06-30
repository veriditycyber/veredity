// Multi-provider AI client used across Veridity (TrueHire interview AI, Forge coach,
// decision helper). One small dispatcher over Anthropic (Claude), OpenAI (GPT) and
// Google (Gemini). Server-only — reads provider API keys from env.
import { MODELS, getModel, DEFAULT_MODEL_ID, PROVIDER_ENV, type Provider, type ModelDef } from "./models";

export type ChatMsg = { role: "user" | "assistant"; content: string };

// Back-compat exports (older routes import these).
export const AI_KEY = process.env.ANTHROPIC_API_KEY || "";
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export function providerKey(p: Provider): string {
  return process.env[PROVIDER_ENV[p]] || "";
}
export function providerConfigured(p: Provider): boolean {
  return !!providerKey(p);
}
// At least one provider configured?
export function anyProviderConfigured(): boolean {
  return (Object.keys(PROVIDER_ENV) as Provider[]).some(providerConfigured);
}
// Model list annotated with availability — used by /api/models.
export function modelsWithAvailability() {
  return MODELS.map((m) => ({ id: m.id, label: m.label, provider: m.provider, tier: m.tier, blurb: m.blurb, available: providerConfigured(m.provider) }));
}
// Resolve a usable model: requested id if its provider has a key, else the first
// available model, else the default (which will surface a clear no-key error).
export function resolveModelId(requested?: string | null): ModelDef {
  const want = getModel(requested);
  if (providerConfigured(want.provider)) return want;
  const fallback = MODELS.find((m) => providerConfigured(m.provider));
  return fallback || getModel(DEFAULT_MODEL_ID);
}

export class AIError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

// ---- the dispatcher ----
export async function complete(opts: {
  modelId?: string | null;
  system: string;
  messages: ChatMsg[];
  maxTokens?: number;
}): Promise<{ text: string; model: ModelDef }> {
  const model = getModel(opts.modelId);
  const key = providerKey(model.provider);
  if (!key) throw new AIError("no_ai_key", `${model.label} needs ${PROVIDER_ENV[model.provider]} to be configured.`);
  const maxTokens = opts.maxTokens ?? 1024;
  let text: string;
  if (model.provider === "anthropic") text = await callAnthropic(key, model.model, opts.system, opts.messages, maxTokens);
  else if (model.provider === "openai") text = await callOpenAI(key, model.model, opts.system, opts.messages, maxTokens);
  else text = await callGemini(key, model.model, opts.system, opts.messages, maxTokens);
  return { text: text.trim(), model };
}

// Convenience wrapper returning just text (used by Forge + interview helpers).
export async function ai(system: string, messages: ChatMsg[], maxTokens = 1024, modelId?: string | null): Promise<string> {
  const { text } = await complete({ modelId, system, messages, maxTokens });
  return text;
}
// Legacy name kept so existing Forge code keeps working.
export async function claude(system: string, messages: ChatMsg[], maxTokens = 1024, modelId?: string | null): Promise<string> {
  return ai(system, messages, maxTokens, modelId);
}

async function callAnthropic(key: string, model: string, system: string, messages: ChatMsg[], maxTokens: number) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) throw new AIError("provider_error", (await r.text()).slice(0, 280));
  const d = await r.json();
  return (d.content || []).map((c: any) => c.text || "").join("");
}

async function callOpenAI(key: string, model: string, system: string, messages: ChatMsg[], maxTokens: number) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "system", content: system }, ...messages] }),
  });
  if (!r.ok) throw new AIError("provider_error", (await r.text()).slice(0, 280));
  const d = await r.json();
  return d.choices?.[0]?.message?.content || "";
}

async function callGemini(key: string, model: string, system: string, messages: ChatMsg[], maxTokens: number) {
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: maxTokens } }),
  });
  if (!r.ok) throw new AIError("provider_error", (await r.text()).slice(0, 280));
  const d = await r.json();
  return (d.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
}

export function extractJSON<T = any>(text: string): T | null {
  try { const m = text.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : text); } catch { return null; }
}
