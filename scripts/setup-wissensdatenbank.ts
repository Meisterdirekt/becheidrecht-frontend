/**
 * Wissensdatenbank-Setup-Script
 *
 * Prüft ob die Wissensdatenbank-Tabellen in Supabase existieren.
 * Falls ja: befüllt die kennzahlen-Tabelle mit aktuellen Grundwerten.
 * Falls nein: gibt vollständiges SQL + Deployment-Anleitung aus.
 *
 * Ausführen mit:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... npx ts-node -r tsconfig-paths/register scripts/setup-wissensdatenbank.ts
 *
 * Voraussetzung: supabase/wissensdatenbank.sql wurde bereits im Supabase SQL-Editor ausgeführt.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xprrzmcickfparpogbpj.supabase.co';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY fehlt!');
  console.error(
    '   Führe aus: SUPABASE_SERVICE_ROLE_KEY=dein-key npx ts-node -r tsconfig-paths/register scripts/setup-wissensdatenbank.ts'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TABELLEN = ['urteile', 'kennzahlen', 'behoerdenfehler', 'update_protokoll', 'sessions', 'analysis_results'] as const;

async function checkTabelle(name: string): Promise<boolean> {
  const { error } = await supabase.from(name).select('id').limit(1);
  // Kein Fehler → Tabelle existiert
  // PGRST116 = no rows found → existiert auch
  // 42P01 → existiert nicht
  if (!error) return true;
  if (error.code === 'PGRST116') return true;
  return false;
}

async function main() {
  console.log('🔍 Prüfe Wissensdatenbank-Tabellen...\n');

  const ergebnisse: Record<string, boolean> = {};

  for (const tabelle of TABELLEN) {
    const exists = await checkTabelle(tabelle);
    ergebnisse[tabelle] = exists;
    console.log(`  ${exists ? '✅' : '❌'} ${tabelle}`);
  }

  const fehlende = TABELLEN.filter((t) => !ergebnisse[t]);

  if (fehlende.length > 0) {
    console.log(`\n⚠️  ${fehlende.length} Tabelle(n) fehlen: ${fehlende.join(', ')}`);
    console.log('\n📋 Deployment-Anleitung:');
    console.log('   1. Supabase Dashboard öffnen → SQL Editor → New Query');
    console.log('   2. Inhalt von supabase/wissensdatenbank.sql einfügen → Run');
    console.log('   3. Prüfen: Table Editor → alle 6 Tabellen sichtbar');
    console.log('   4. Dieses Script erneut ausführen\n');

    const sqlPath = path.join(process.cwd(), 'supabase', 'wissensdatenbank.sql');
    if (fs.existsSync(sqlPath)) {
      console.log(`📄 SQL-Datei gefunden: ${sqlPath}`);
      console.log('   → Inhalt für manuelles Deployment bereit\n');
    } else {
      console.error(`❌ SQL-Datei nicht gefunden: ${sqlPath}`);
    }

    process.exit(1);
  }

  console.log('\n✅ Alle 6 Tabellen vorhanden!\n');

  // Prüfe ob kennzahlen bereits befüllt
  const { count } = await supabase
    .from('kennzahlen')
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) > 0) {
    console.log(`ℹ️  kennzahlen-Tabelle bereits befüllt (${count} Einträge) — kein Seeding nötig.`);
  } else {
    console.log('📊 kennzahlen-Tabelle leer — Grundwerte müssen via SQL eingespielt werden.');
    console.log('   → Führe supabase/wissensdatenbank.sql im SQL-Editor aus (enthält INSERT-Statements).');
  }

  // Prüfe ob behoerdenfehler befüllt
  const { count: fehlerCount } = await supabase
    .from('behoerdenfehler')
    .select('id', { count: 'exact', head: true });

  if ((fehlerCount ?? 0) > 0) {
    console.log(`ℹ️  behoerdenfehler-Tabelle bereits befüllt (${fehlerCount} Einträge).`);
  } else {
    console.log('\n📋 behoerdenfehler-Tabelle leer. Befüllen mit:');
    console.log('   npx ts-node -r tsconfig-paths/register scripts/sync-fehlerkatalog.ts');
  }

  console.log('\n✅ Setup abgeschlossen.\n');
}

main().catch((err) => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});
