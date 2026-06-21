// Lightweight fixed-window rate limiter for auth endpoints (brute-force / email
// bombing defense). In-memory + per-process — fine for single-instance; a real
// multi-instance deploy should back this with Redis. Pinned on globalThis so it
// survives HMR and is shared across route-handler bundles.

interface Bucket {
  count: number;
  resetAt: number;
}

const g = globalThis as unknown as { __flowblokRL?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (g.__flowblokRL ??= new Map());

export interface RateResult {
  allowed: boolean;
  retryAfter: number; // seconds until the window resets
}

/** Allow up to `max` hits per `windowMs` for `key`. */
export function rateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (b.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (no Request.ip in route handlers). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

const MIN = 60_000;

/** Standard 429 helper. Returns null when allowed. */
export function limitOr429(key: string, max: number, windowMs: number) {
  const r = rateLimit(key, max, windowMs);
  if (r.allowed) return null;
  return {
    status: 429,
    body: { ok: false, error: `Too many attempts. Try again in ${Math.ceil(r.retryAfter / 60)} min.` },
  };
}

export const WINDOWS = { fifteenMin: 15 * MIN, tenMin: 10 * MIN, hour: 60 * MIN };
