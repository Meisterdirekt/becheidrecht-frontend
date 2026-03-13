#!/usr/bin/env npx tsx
/**
 * BescheidRecht — Automatische DB-Migration
 *
 * Führt SQL-Dateien aus supabase/ gegen die Supabase-DB aus
 * via Supabase Management API (DDL + DML).
 *
 * Verwendung:
 *   npx tsx scripts/db-migrate.ts                    # Alle SQL-Dateien
 *   npx tsx scripts/db-migrate.ts wissensdatenbank   # Einzelne Datei
 *   npx tsx scripts/db-migrate.ts --dry-run          # Nur anzeigen
 *
 * Voraussetzung:
 *   SUPABASE_ACCESS_TOKEN in .env.local (https://supabase.com/dashboard/account/tokens)
 *   NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import fs from 'fs';
import path from 'path';

const SQL_DIR = path.join(__dirname, '..', 'supabase');
const ENV_FILE = path.join(__dirname, '..', '.env.local');
const MGMT_API = 'https://api.supabase.com';

const MIGRATION_ORDER = [
  'wissensdatenbank.sql',
  'supabase_subscription_table_FIXED.sql',
  'fristen_table.sql',
  'feedback_table.sql',
  'feedback_policies.sql',
  'b2b_organizations.sql',
  'ag15-monitor.sql',
  'rls_fix_plans_single_purchases.sql',
];

function loadEnvVar(key: string): string {
  const content = fs.readFileSync(ENV_FILE, 'utf-8');
  const match = content.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'));
  if (!match) throw new Error(`${key} nicht in .env.local gefunden`);
  return match[1].replace(/"$/, '');
}

async function executeSql(sql: string, projectRef: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${MGMT_API}/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) return { success: true };

  const body = await res.text();
  try {
    const json = JSON.parse(body);
    return { success: false, error: json.message || json.error || body };
  } catch {
    return { success: false, error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filterName = args.find(a => !a.startsWith('--'));

  let accessToken: string;
  try {
    accessToken = loadEnvVar('SUPABASE_ACCESS_TOKEN');
  } catch {
    console.error('❌ SUPABASE_ACCESS_TOKEN fehlt in .env.local');
    console.error('   Erstelle einen unter: https://supabase.com/dashboard/account/tokens');
    console.error('   Dann in .env.local eintragen: SUPABASE_ACCESS_TOKEN="sbp_..."');
    process.exit(1);
  }

  const supabaseUrl = loadEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1];
  if (!projectRef) {
    console.error('❌ Kann Projekt-Ref nicht aus SUPABASE_URL extrahieren');
    process.exit(1);
  }

  // SQL-Dateien: geordnet + Rest
  let files = MIGRATION_ORDER.filter(f => fs.existsSync(path.join(SQL_DIR, f)));
  const allSqlFiles = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql'));
  for (const f of allSqlFiles) {
    if (!files.includes(f)) files.push(f);
  }

  if (filterName) {
    files = files.filter(f => f.includes(filterName));
    if (files.length === 0) {
      console.error(`❌ Keine SQL-Datei mit "${filterName}" gefunden`);
      process.exit(1);
    }
  }

  console.log(`\n🗄️  BescheidRecht DB-Migration`);
  console.log(`   Projekt: ${projectRef}`);
  console.log(`   Dateien: ${files.length}`);
  console.log(`   Modus:   ${dryRun ? 'DRY-RUN' : 'LIVE'}\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SQL_DIR, file), 'utf-8');
    const sizeKb = (Buffer.byteLength(sql) / 1024).toFixed(1);

    if (dryRun) {
      console.log(`  📄 ${file} (${sizeKb} KB)`);
      continue;
    }

    process.stdout.write(`  ⏳ ${file} (${sizeKb} KB)...`);
    const result = await executeSql(sql, projectRef, accessToken);

    if (result.success) {
      console.log(' ✅');
      success++;
    } else {
      console.log(` ❌\n     ${result.error}`);
      failed++;
    }
  }

  console.log(`\n🏁 ${success} erfolgreich, ${failed} fehlgeschlagen, ${files.length} gesamt\n`);
  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
