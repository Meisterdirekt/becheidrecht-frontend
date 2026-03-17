-- Atomarer Feld-Inkrement per RPC
-- Verhindert Race Condition bei gleichzeitigen Requests (z.B. Org-Pool-Abbuchen)
--
-- Verwendung: supabase.rpc('increment_field', { table_name: 'organizations', field_name: 'analyses_used', row_id: 'uuid' })

CREATE OR REPLACE FUNCTION increment_field(
  table_name TEXT,
  field_name TEXT,
  row_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Nur erlaubte Tabellen/Felder zulassen (Whitelist gegen SQL-Injection)
  IF table_name = 'organizations' AND field_name = 'analyses_used' THEN
    UPDATE organizations
    SET analyses_used = analyses_used + 1
    WHERE id = row_id;
  ELSIF table_name = 'organization_members' AND field_name = 'analyses_used' THEN
    UPDATE organization_members
    SET analyses_used = analyses_used + 1
    WHERE org_id = row_id;
  ELSE
    RAISE EXCEPTION 'Nicht erlaubte Tabelle/Feld-Kombination: %.%', table_name, field_name;
  END IF;
END;
$$;

-- Nur Service-Role darf diese Funktion aufrufen
REVOKE ALL ON FUNCTION increment_field(TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION increment_field(TEXT, TEXT, UUID) FROM anon;
REVOKE ALL ON FUNCTION increment_field(TEXT, TEXT, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_field(TEXT, TEXT, UUID) TO service_role;
