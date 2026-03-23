/**
 * Redis-basierter Concurrency-Limiter mit Warteschlange.
 *
 * Begrenzt gleichzeitige Analysen auf MAX_CONCURRENT.
 * Bei Überlast: bis zu MAX_RETRIES Warteversuche mit Backoff.
 * Erst wenn Queue-Timeout erreicht → 503.
 *
 * Safety-Net: TTL auf dem Redis-Key verhindert permanentes Blockieren
 * falls ein Request nach INCR crasht ohne DECR aufzurufen.
 */

import { Redis } from "@upstash/redis";

const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | undefined;
if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
    token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim(),
  });
}

const SEMAPHORE_KEY = "br:analyze:concurrent";
const MAX_CONCURRENT = 10;
const SAFETY_TTL = 300; // 5 Minuten

// Queue-Konfiguration
const MAX_RETRIES = 6;          // 6 Versuche
const BASE_DELAY_MS = 2_000;    // 2s Start-Delay
const MAX_DELAY_MS = 15_000;    // Max 15s pro Retry
const MAX_QUEUE_WAIT_MS = 60_000; // 60s Queue-Timeout gesamt

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Versucht einen Analyse-Slot zu bekommen.
 * Bei Überlast: wartet mit exponentiellem Backoff (bis 60s).
 *
 * @returns { acquired: true, queuedMs: 0 } — sofort Slot bekommen
 * @returns { acquired: true, queuedMs: N } — nach N ms Wartezeit Slot bekommen
 * @returns { acquired: false, queuedMs: N } — nach N ms Wartezeit kein Slot frei
 */
export async function acquireSlot(): Promise<{ acquired: boolean; queuedMs: number }> {
  if (!redis) return { acquired: true, queuedMs: 0 };

  const startTime = Date.now();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const current = await redis.incr(SEMAPHORE_KEY);

      if (current === 1) {
        await redis.expire(SEMAPHORE_KEY, SAFETY_TTL);
      }

      if (current <= MAX_CONCURRENT) {
        return { acquired: true, queuedMs: Date.now() - startTime };
      }

      // Slot voll — zurückgeben und warten
      await redis.decr(SEMAPHORE_KEY);

      // Letzter Versuch? Nicht mehr warten.
      if (attempt === MAX_RETRIES) break;

      // Queue-Timeout prüfen
      const elapsed = Date.now() - startTime;
      if (elapsed >= MAX_QUEUE_WAIT_MS) break;

      // Exponentieller Backoff: 2s, 4s, 8s, 15s, 15s, 15s
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
      // Jitter: ±25% um Thundering-Herd zu vermeiden
      const jitter = delay * (0.75 + Math.random() * 0.5);
      await sleep(Math.min(jitter, MAX_QUEUE_WAIT_MS - elapsed));
    } catch {
      return { acquired: true, queuedMs: Date.now() - startTime };
    }
  }

  return { acquired: false, queuedMs: Date.now() - startTime };
}

export async function releaseSlot(): Promise<void> {
  if (!redis) return;

  try {
    const val = await redis.decr(SEMAPHORE_KEY);
    if (val < 0) {
      await redis.set(SEMAPHORE_KEY, 0, { ex: SAFETY_TTL });
    }
  } catch {
    // Redis down — ignorieren
  }
}

/** Aktuelle Auslastung abfragen (für Monitoring). */
export async function getSlotUsage(): Promise<{ current: number; max: number }> {
  if (!redis) return { current: 0, max: MAX_CONCURRENT };
  try {
    const current = await redis.get<number>(SEMAPHORE_KEY) ?? 0;
    return { current, max: MAX_CONCURRENT };
  } catch {
    return { current: 0, max: MAX_CONCURRENT };
  }
}
