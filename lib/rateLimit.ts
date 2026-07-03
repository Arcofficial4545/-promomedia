import "server-only";

/**
 * In-memory sliding-window rate limiter. Per-process (fine for a single
 * Node deployment; swap for a shared store if the app is ever scaled out).
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean } {
  const now = Date.now();

  // Occasionally sweep dead buckets so the map doesn't grow unbounded.
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      if (hits.length === 0 || hits[hits.length - 1] < now - 300_000) {
        buckets.delete(k);
      }
    }
  }

  const windowStart = now - opts.windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  if (hits.length >= opts.limit) {
    buckets.set(key, hits);
    return { ok: false };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

/** Best-effort client identifier from proxy headers. */
export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : (headers.get("x-real-ip") ?? "local");
  return ip;
}
