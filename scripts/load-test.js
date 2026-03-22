#!/usr/bin/env node

/**
 * Load-Test für BescheidRecht API
 *
 * Verwendet: Node.js native fetch (kein k6/Artillery nötig)
 *
 * Nutzung:
 *   node scripts/load-test.js                          # Default: 10 concurrent, health endpoint
 *   node scripts/load-test.js --concurrent 50 --endpoint health
 *   node scripts/load-test.js --concurrent 100 --endpoint analyze --token YOUR_JWT
 *   node scripts/load-test.js --concurrent 20 --endpoint subscription --token YOUR_JWT
 *
 * Endpoints:
 *   health        — GET /api/health (kein Auth)
 *   subscription  — GET /api/subscription-status (Auth)
 *   analyze       — POST /api/analyze (Auth, teuer!)
 *   fristen       — GET /api/fristen (Auth)
 */

const BASE_URL = process.env.BASE_URL || "https://www.bescheidrecht.de";

// --- CLI Args ---
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const CONCURRENT = parseInt(getArg("concurrent", "10"));
const ENDPOINT = getArg("endpoint", "health");
const TOKEN = getArg("token", "");
const ROUNDS = parseInt(getArg("rounds", "3"));

// --- Endpoint-Definitionen ---
const endpoints = {
  health: {
    method: "GET",
    path: "/api/health",
    auth: false,
    description: "Health-Check (leicht, kein Auth)",
  },
  subscription: {
    method: "GET",
    path: "/api/subscription-status",
    auth: true,
    description: "Subscription-Status (Auth + DB-Query)",
  },
  fristen: {
    method: "GET",
    path: "/api/fristen",
    auth: true,
    description: "Fristen-Abfrage (Auth + DB-Query)",
  },
  analyze: {
    method: "POST",
    path: "/api/analyze",
    auth: true,
    description: "Analyse-Pipeline (TEUER! Nur mit Bedacht testen)",
    body: () => {
      const form = new FormData();
      form.append("text", "Sehr geehrte Frau Müller, Ihr Antrag auf Bürgergeld wird abgelehnt. Die Begründung entnehmen Sie dem beigefügten Bescheid. Widerspruchsfrist: 1 Monat. Jobcenter Berlin Mitte.");
      return form;
    },
  },
};

// --- Einzelner Request ---
async function singleRequest(endpoint, requestId) {
  const config = endpoints[endpoint];
  if (!config) {
    console.error(`Unbekannter Endpoint: ${endpoint}`);
    process.exit(1);
  }

  const headers = {};
  if (config.auth) {
    if (!TOKEN) {
      console.error("Token benötigt! Nutze: --token YOUR_JWT");
      process.exit(1);
    }
    headers["Authorization"] = `Bearer ${TOKEN}`;
  }

  const fetchOptions = {
    method: config.method,
    headers,
    signal: AbortSignal.timeout(120_000), // 2 Min Timeout
  };

  if (config.body) {
    fetchOptions.body = config.body();
  }

  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${config.path}`, fetchOptions);
    const duration = performance.now() - start;
    const status = res.status;

    // Body lesen um Connection freizugeben
    let bodySize = 0;
    try {
      const text = await res.text();
      bodySize = text.length;
    } catch { /* ignore */ }

    return {
      requestId,
      status,
      duration: Math.round(duration),
      success: status >= 200 && status < 400,
      rateLimited: status === 429,
      error: null,
      bodySize,
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      requestId,
      status: 0,
      duration: Math.round(duration),
      success: false,
      rateLimited: false,
      error: err.message || "Unknown error",
      bodySize: 0,
    };
  }
}

// --- Runde ausführen ---
async function runRound(roundNum, concurrent, endpoint) {
  console.log(`\n--- Runde ${roundNum}/${ROUNDS}: ${concurrent} gleichzeitige Requests → ${endpoint} ---`);

  const promises = [];
  for (let i = 0; i < concurrent; i++) {
    promises.push(singleRequest(endpoint, i + 1));
  }

  const results = await Promise.allSettled(promises);
  return results.map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: r.reason, duration: 0, status: 0 }));
}

// --- Statistiken ---
function printStats(results, roundNum) {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success && !r.rateLimited);
  const rateLimited = results.filter((r) => r.rateLimited);
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);

  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
  const max = durations[durations.length - 1] || 0;
  const min = durations[0] || 0;

  console.log(`
  Runde ${roundNum} Ergebnis:
  ┌─────────────────────────────────────────────────┐
  │ Gesamt:        ${String(results.length).padStart(5)}                            │
  │ Erfolgreich:   ${String(successful.length).padStart(5)} (${((successful.length / results.length) * 100).toFixed(1)}%)                   │
  │ Rate-Limited:  ${String(rateLimited.length).padStart(5)} (429)                       │
  │ Fehler:        ${String(failed.length).padStart(5)}                            │
  ├─────────────────────────────────────────────────┤
  │ Response-Zeiten (ms):                           │
  │   Min:    ${String(min).padStart(7)} ms                          │
  │   Avg:    ${String(avg).padStart(7)} ms                          │
  │   P50:    ${String(p50).padStart(7)} ms                          │
  │   P95:    ${String(p95).padStart(7)} ms                          │
  │   P99:    ${String(p99).padStart(7)} ms                          │
  │   Max:    ${String(max).padStart(7)} ms                          │
  └─────────────────────────────────────────────────┘`);

  // Fehler-Details
  if (failed.length > 0) {
    console.log("\n  Fehler-Details:");
    const errorCounts = {};
    for (const f of failed) {
      const key = f.error || `HTTP ${f.status}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    }
    for (const [err, count] of Object.entries(errorCounts)) {
      console.log(`    ${count}x: ${err}`);
    }
  }

  return { successful: successful.length, rateLimited: rateLimited.length, failed: failed.length, avg, p95, p99, max };
}

// --- Hauptprogramm ---
async function main() {
  const config = endpoints[ENDPOINT];
  if (!config) {
    console.error(`Unbekannter Endpoint: ${ENDPOINT}`);
    console.error(`Verfügbar: ${Object.keys(endpoints).join(", ")}`);
    process.exit(1);
  }

  console.log(`
╔═══════════════════════════════════════════════════════╗
║  BescheidRecht Load-Test                              ║
╠═══════════════════════════════════════════════════════╣
║  Target:     ${BASE_URL.padEnd(41)}║
║  Endpoint:   ${(ENDPOINT + " — " + config.description).padEnd(41).slice(0, 41)}║
║  Concurrent: ${String(CONCURRENT).padEnd(41)}║
║  Rounds:     ${String(ROUNDS).padEnd(41)}║
║  Auth:       ${String(config.auth ? "Ja (Bearer Token)" : "Nein").padEnd(41)}║
╚═══════════════════════════════════════════════════════╝`);

  if (ENDPOINT === "analyze") {
    console.log("\n  ⚠ WARNUNG: Analyse-Endpoint verursacht API-Kosten (~€0,15/Request)!");
    console.log(`  ${CONCURRENT} Requests × ${ROUNDS} Runden = ~€${(CONCURRENT * ROUNDS * 0.15).toFixed(2)} geschätzte Kosten`);
    console.log("  Drücke Ctrl+C innerhalb 5s zum Abbrechen...\n");
    await new Promise((r) => setTimeout(r, 5000));
  }

  const allStats = [];

  for (let round = 1; round <= ROUNDS; round++) {
    const results = await runRound(round, CONCURRENT, ENDPOINT);
    const stats = printStats(results, round);
    allStats.push(stats);

    // Pause zwischen Runden
    if (round < ROUNDS) {
      console.log("  Pause 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // --- Gesamtergebnis ---
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  GESAMTERGEBNIS                                       ║
╠═══════════════════════════════════════════════════════╣`);

  const totalRequests = CONCURRENT * ROUNDS;
  const totalSuccess = allStats.reduce((s, r) => s + r.successful, 0);
  const totalRL = allStats.reduce((s, r) => s + r.rateLimited, 0);
  const totalFailed = allStats.reduce((s, r) => s + r.failed, 0);
  const avgP95 = Math.round(allStats.reduce((s, r) => s + r.p95, 0) / allStats.length);
  const maxLatency = Math.max(...allStats.map((r) => r.max));

  console.log(`║  Requests:     ${totalRequests}                                    ║`);
  console.log(`║  Erfolg:       ${totalSuccess} (${((totalSuccess / totalRequests) * 100).toFixed(1)}%)                           ║`);
  console.log(`║  Rate-Limited: ${totalRL}                                    ║`);
  console.log(`║  Fehler:       ${totalFailed}                                    ║`);
  console.log(`║  Avg P95:      ${avgP95}ms                                 ║`);
  console.log(`║  Max Latency:  ${maxLatency}ms                                ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);

  // --- Engpass-Analyse ---
  console.log(`
┌───────────────────────────────────────────────────────┐
│  ENGPASS-ANALYSE                                      │
├───────────────────────────────────────────────────────┤`);

  if (totalRL > 0) {
    console.log(`│  ⚠ Rate-Limiting greift: ${totalRL}/${totalRequests} Requests blockiert       │`);
    console.log(`│    → Erster Engpass: Upstash Rate-Limiter                 │`);
  }
  if (totalFailed > 0) {
    console.log(`│  ❌ ${totalFailed} Requests fehlgeschlagen                          │`);
    console.log(`│    → Mögliche Ursachen: Timeout, Connection-Limit, OOM   │`);
  }
  if (avgP95 > 5000) {
    console.log(`│  🐌 P95 > 5s: Server unter Last                           │`);
  }
  if (avgP95 > 30000) {
    console.log(`│  💀 P95 > 30s: Serverless Function Timeout wahrscheinlich │`);
  }
  if (totalSuccess === totalRequests) {
    console.log(`│  ✅ Alle Requests erfolgreich bei ${CONCURRENT} Concurrent       │`);
    console.log(`│    → Nächster Test: --concurrent ${CONCURRENT * 2}                     │`);
  }

  console.log(`└───────────────────────────────────────────────────────────┘`);
}

main().catch(console.error);
