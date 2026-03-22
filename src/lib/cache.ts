/**
 * Einfacher In-Memory TTL-Cache für Serverless.
 *
 * Funktioniert gut für warme Vercel-Instanzen: Solange die Instanz lebt,
 * werden wiederholte DB-Queries vermieden. Bei Cold-Start wird neu geladen.
 *
 * Für Wissensdaten (Fehlerkatalog, Kennzahlen, Urteile) ideal:
 * - Ändern sich selten (wöchentlich/jährlich)
 * - Werden bei jeder Analyse geladen
 * - Kleine Datenmengen (<200 Rows)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Liest aus dem Cache oder führt die Loader-Funktion aus.
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
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.data;
  }

  const data = await loader();
  store.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

/** Cache-Key manuell invalidieren (z.B. nach DB-Write). */
export function invalidate(key: string): void {
  store.delete(key);
}

/** Alle Cache-Einträge löschen. */
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
