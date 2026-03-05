/**
 * Einmaliges Setup-Script: Legt die user_fristen Tabelle in Supabase an.
 *
 * Ausführen mit:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... npx ts-node scripts/setup-fristen-table.ts
 *
 * Oder: Service Role Key in .env.local eintragen, dann:
 *   npx ts-node --project tsconfig.json -r tsconfig-paths/register scripts/setup-fristen-table.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xprrzmcickfparpogbpj.supabase.co";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt!");
  console.error(
    "   Führe aus: SUPABASE_SERVICE_ROLE_KEY=dein-key npx ts-node scripts/setup-fristen-table.ts"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL = `
CREATE TABLE IF NOT EXISTS user_fristen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  behoerde text,
  rechtsgebiet text,
  untergebiet text,
  bescheid_datum text,
  frist_datum date,
  status text NOT NULL DEFAULT 'offen',
  notizen text,
  musterschreiben text,
  analyse_meta jsonb
);

ALTER TABLE user_fristen ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_fristen'
    AND policyname = 'Users can manage their own fristen'
  ) THEN
    CREATE POLICY "Users can manage their own fristen"
      ON user_fristen FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS user_fristen_user_id_idx ON user_fristen(user_id);
CREATE INDEX IF NOT EXISTS user_fristen_frist_datum_idx ON user_fristen(frist_datum);
`;

async function main() {
  console.log("🔧 Lege user_fristen Tabelle an...");

  const { error } = await supabase.rpc("exec_sql", { sql: SQL }).single();

  if (error) {
    // Fallback: direkte REST-API
    console.log("RPC nicht verfügbar, versuche direkten Ansatz...");

    // Teste ob Tabelle bereits existiert
    const { error: checkError } = await supabase
      .from("user_fristen")
      .select("id")
      .limit(1);

    if (!checkError) {
      console.log("✅ Tabelle user_fristen existiert bereits!");
      return;
    }

    console.error("❌ Tabelle konnte nicht angelegt werden:", error.message);
    console.log("\n📋 Bitte führe dieses SQL manuell im Supabase Dashboard aus:");
    console.log("   Dashboard → SQL Editor → New Query → SQL einfügen → Run\n");
    console.log(SQL);
    process.exit(1);
  }

  console.log("✅ Tabelle user_fristen erfolgreich angelegt!");
}

main().catch(console.error);
