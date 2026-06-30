// Pure model registry — safe to import from client and server (no secrets here).
// Availability (which provider keys are configured) is resolved server-side in lib/ai.ts
// and surfaced to the client via /api/models.

export type Provider = "anthropic" | "openai" | "google";
export type Tier = "frontier" | "balanced" | "fast";

export type ModelDef = {
  id: string;        // stable internal id used across the app
  label: string;     // shown in the picker
  provider: Provider;
  model: string;     // the provider's actual model string (editable as providers update)
  tier: Tier;
  blurb: string;
};

export const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: "Anthropic — Claude",
  openai: "OpenAI — GPT",
  google: "Google — Gemini",
};

// Env var that holds each provider's API key (documented in PRODUCTION-SETUP.md).
export const PROVIDER_ENV: Record<Provider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GEMINI_API_KEY",
};

export const MODELS: ModelDef[] = [
  { id: "claude-opus",   label: "Claude Opus 4.8",   provider: "anthropic", model: "claude-opus-4-8",          tier: "frontier", blurb: "Deepest reasoning" },
  { id: "claude-sonnet", label: "Claude Sonnet 4.6", provider: "anthropic", model: "claude-sonnet-4-6",        tier: "balanced", blurb: "Best all-round" },
  { id: "claude-haiku",  label: "Claude Haiku 4.5",  provider: "anthropic", model: "claude-haiku-4-5-20251001", tier: "fast",    blurb: "Fastest & cheapest" },
  { id: "gpt-4o",        label: "GPT-4o",            provider: "openai",    model: "gpt-4o",                   tier: "frontier", blurb: "OpenAI flagship" },
  { id: "gpt-4o-mini",   label: "GPT-4o mini",       provider: "openai",    model: "gpt-4o-mini",              tier: "fast",     blurb: "Fast & cheap" },
  { id: "gemini-pro",    label: "Gemini 2.5 Pro",    provider: "google",    model: "gemini-2.5-pro",           tier: "frontier", blurb: "Google flagship" },
  { id: "gemini-flash",  label: "Gemini 2.5 Flash",  provider: "google",    model: "gemini-2.5-flash",         tier: "fast",     blurb: "Fast & cheap" },
];

export const DEFAULT_MODEL_ID = "claude-sonnet";

export function getModel(id: string | null | undefined): ModelDef {
  return MODELS.find((m) => m.id === id) || MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!;
}

export const TIER_LABEL: Record<Tier, string> = { frontier: "Frontier", balanced: "Balanced", fast: "Fast" };
