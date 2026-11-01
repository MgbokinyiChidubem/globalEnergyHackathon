/**
 * Fixed-window rate limiter keyed by client (e.g. IP).
 * ponytail: in-memory per server instance, so on serverless each warm instance counts separately;
 * move to a shared store (Upstash/Vercel KV) if abuse gets past it.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string): boolean => {
    const t = now();
    const entry = hits.get(key);
    if (!entry || t > entry.resetAt) {
      if (hits.size > 10_000) hits.clear(); // bound memory
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
