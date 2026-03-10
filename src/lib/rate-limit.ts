import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate-Limiter mit Upstash Redis.
 *
 * Wenn UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN gesetzt sind,
 * wird Redis verwendet (persistiert ueber Serverless-Instanzen hinweg).
 * Sonst: In-Memory-Fallback (funktioniert lokal, aber nicht serverless-safe).
 */

const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | undefined;
if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// ---------------------------------------------------------------------------
// In-Memory Fallback (fuer lokale Entwicklung ohne Redis)
// ---------------------------------------------------------------------------
interface MemoryEntry {
  count: number;
  resetAt: number;
}

class MemoryLimiter {
  private map = new Map<string, MemoryEntry>();
  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {
    setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.map.entries()) {
        if (v.resetAt < now) this.map.delete(k);
      }
    }, Math.min(windowMs, 60_000)).unref();
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const entry = this.map.get(identifier);
    if (!entry || entry.resetAt < now) {
      this.map.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { success: true };
    }
    if (entry.count >= this.maxRequests) return { success: false };
    entry.count++;
    return { success: true };
  }
}

// ---------------------------------------------------------------------------
// Limiter-Definitionen
// ---------------------------------------------------------------------------
interface RateLimiter {
  limit(identifier: string): Promise<{ success: boolean }>;
}

function parseDuration(d: string): number {
  const match = d.match(/^(\d+)(m|h|d|s)$/);
  if (!match) return 60_000;
  const n = parseInt(match[1]);
  switch (match[2]) {
    case "s": return n * 1_000;
    case "m": return n * 60_000;
    case "h": return n * 3_600_000;
    case "d": return n * 86_400_000;
    default: return 60_000;
  }
}

type WindowSpec = [max: number, duration: Duration];

function buildLimiter([max, duration]: WindowSpec): RateLimiter {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, duration),
      analytics: false,
    });
  }
  return new MemoryLimiter(max, parseDuration(duration));
}

/** /api/analyze — eingeloggte User: 5 Anfragen / 15 Min */
export const analyzeLimiter = buildLimiter([5, "15m"]);

/** /api/analyze — anonyme Demo: 1 Anfrage / 24 Std pro IP */
export const analyzeAnonLimiter = buildLimiter([1, "24h"]);

/** /api/generate-letter — 10 Anfragen / 1 Std */
export const letterLimiter = buildLimiter([10, "1h"]);

/** /api/assistant — 20 Anfragen / 1 Std */
export const assistantLimiter = buildLimiter([20, "1h"]);

/** /api/fristen — 30 Anfragen / 1 Min pro User */
export const fristenLimiter = buildLimiter([30, "1m"]);

export { isRedisConfigured };
