// Sanctions / watchlist screening via OpenSanctions (aggregates OFAC SDN, EU, UN,
// UK, and PEP lists). Server-only. Advisory: a hit means "manual review required",
// never an automated rejection — watchlist name-matching has real false-positive rates.
// Degrades gracefully: without OPENSANCTIONS_API_KEY the signal is simply skipped.
const KEY = process.env.OPENSANCTIONS_API_KEY || "";
const BASE = (process.env.OPENSANCTIONS_API_BASE || "https://api.opensanctions.org").replace(/\/$/, "");
const THRESHOLD = 0.7; // score above which we treat a candidate as a likely match

export function sanctionsConfigured(): boolean {
  return !!KEY;
}

export type SanctionMatch = { name: string; score: number; datasets: string[]; topic?: string };
export type ScreenResult = { hit: boolean; topScore: number; matches: SanctionMatch[] };

export async function screenName(name: string, country?: string): Promise<ScreenResult | null> {
  if (!KEY || !name || name.trim().length < 3) return null;
  const props: any = { name: [name.trim()] };
  if (country) props.country = [country];
  try {
    const r = await fetch(`${BASE}/match/default`, {
      method: "POST",
      headers: { authorization: `ApiKey ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ queries: { q1: { schema: "Person", properties: props } } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const results = (d?.responses?.q1?.results || []) as any[];
    const matches: SanctionMatch[] = results.slice(0, 5).map((m) => ({
      name: m.caption || (m.properties?.name?.[0] ?? "Unknown"),
      score: typeof m.score === "number" ? m.score : 0,
      datasets: m.datasets || [],
      topic: (m.properties?.topics || [])[0],
    }));
    const topScore = matches.reduce((s, m) => Math.max(s, m.score), 0);
    return { hit: topScore >= THRESHOLD, topScore, matches };
  } catch {
    return null;
  }
}
