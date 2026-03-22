/**
 * L1/L2 TTL-Cache für Serverless.
 *
 * L1: In-Memory Map (0ms, pro Vercel-Instanz)
 * L2: Upstash Redis (shared über alle Instanzen, ~5-15ms)
 *
 * Für Wissensdaten (Fehlerkatalog, Kennzahlen, Urteile) ideal:
 * - Ändern sich selten (wöchentlich/jährlich)
 * - Werden bei jeder Analyse geladen
 * - Kleine Datenmengen (<200 Rows)
 */

import { Redis } from "@upstash/redis";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// --- L1: In-Memory ---
const store = new Map<string, CacheEntry<unknown>>();

// --- L2: Upstash Redis ---
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

const CACHE_PREFIX = "br:cache:";

/**
 * Liest aus L1 → L2 → Loader. Schreibt zurück in beide Layer.
 *
 * @param key   Eindeutiger Cache-Key
 * @param ttlMs Time-to-live in Millisekunden
 * @param loader Async-Funktion die Daten lädt (wird nur bei Cache-Miss aufgerufen)
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();

  // L1 Check
  const l1 = store.get(key) as CacheEntry<T> | undefined;
  if (l1 && l1.expiresAt > now) {
    return l1.data;
  }

  // L2 Check (Redis)
  if (redis) {
    try {
      const redisData = await redis.get<T>(CACHE_PREFIX + key);
      if (redisData !== null && redisData !== undefined) {
        store.set(key, { data: redisData, expiresAt: now + ttlMs });
        return redisData;
      }
    } catch {
      // Redis down — weiter zum Loader
    }
  }

  // Cache-Miss: Loader ausführen
  const data = await loader();

  // L1 schreiben
  store.set(key, { data, expiresAt: now + ttlMs });

  // L2 schreiben (non-blocking)
  if (redis) {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    redis.set(CACHE_PREFIX + key, data, { ex: ttlSeconds }).catch(() => {});
  }

  return data;
}

/** Cache-Key manuell invalidieren (z.B. nach DB-Write). */
export function invalidate(key: string): void {
  store.delete(key);
  if (redis) redis.del(CACHE_PREFIX + key).catch(() => {});
}

/** Alle L1-Einträge löschen. Redis-Keys laufen via TTL aus. */
export function clearAll(): void {
  store.clear();
}

// --- TTL-Konstanten ---
/** 5 Minuten — für Daten die sich selten ändern (Fehlerkatalog, Kennzahlen) */
export const TTL_5MIN = 5 * 60 * 1000;
/** 15 Minuten — für quasi-statische Daten (Urteile) */
export const TTL_15MIN = 15 * 60 * 1000;
/** 1 Minute — für Daten die sich öfter ändern (Subscriptions) */
export const TTL_1MIN = 60 * 1000;
