// Best-effort in-memory sliding-window burst limiter (per process). Guards the
// public API against hammering; the durable monthly quota lives in the DB.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((windowMs - (now - arr[0])) / 1000)) };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, remaining: limit - arr.length, retryAfter: 0 };
}
