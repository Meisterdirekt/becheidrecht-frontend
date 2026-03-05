/**
 * Synchronisiert content/behoerdenfehler_logik.json → Supabase behoerdenfehler-Tabelle.
 *
 * Voraussetzung: wissensdatenbank.sql wurde im Supabase SQL-Editor ausgeführt.
 *
 * Verwendung:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/sync-fehlerkatalog.ts
 *
 * Benötigt .env.local mit:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// .env.local laden
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Anführungszeichen entfernen
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

interface FehlerItem {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsbasis?: string[];
  severity: "hinweis" | "wichtig" | "kritisch";
  prueflogik?: { bedingungen?: string[]; suchbegriffe?: string[] };
  musterschreiben_hinweis?: string;
  severity_beschreibung?: string;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.");
    console.error("Prüfe .env.local im Projektverzeichnis.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const items: FehlerItem[] = JSON.parse(raw);

  console.log(`Fehlerkatalog geladen: ${items.length} Einträge`);

  const rows = items.map((item: FehlerItem) => ({
    fehler_id: item.id,
    titel: item.titel,
    beschreibung: item.beschreibung,
    rechtsbasis: item.rechtsbasis ?? [],
    severity: item.severity,
    prueflogik: item.prueflogik ?? null,
    musterschreiben_hinweis: item.musterschreiben_hinweis ?? null,
    severity_beschreibung: item.severity_beschreibung ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("behoerdenfehler")
    .upsert(rows, { onConflict: "fehler_id" });

  if (error) {
    console.error("Sync fehlgeschlagen:", error.message);
    process.exit(1);
  }

  console.log(`Sync erfolgreich: ${rows.length} Einträge in behoerdenfehler upserted.`);

  // Audit-Trail
  await supabase.from("update_protokoll").insert({
    agent_id: "SYNC_SCRIPT",
    tabelle: "behoerdenfehler",
    operation: "FULL_SYNC",
    notiz: `${rows.length} Einträge aus behoerdenfehler_logik.json synchronisiert`,
  });

  console.log("Audit-Trail geschrieben.");
}

main().catch((err: unknown) => {
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});
