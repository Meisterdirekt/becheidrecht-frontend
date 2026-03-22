-- Skalierbarkeits-Optimierung: Composite-Indizes für häufige Query-Patterns
-- Datum: 2026-03-22

-- Dashboard: "Meine letzten Analysen" — häufigster Query
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_created
  ON analysis_results (user_id, created_at DESC);

-- Fristen-Dashboard: Filter nach Status
CREATE INDEX IF NOT EXISTS idx_user_fristen_status
  ON user_fristen (status);

-- Fristen-Dashboard: User + Status Composite (häufigster Filter)
CREATE INDEX IF NOT EXISTS idx_user_fristen_user_status
  ON user_fristen (user_id, status, frist_datum);

-- Org-Members: Schneller Lookup für B2B-Einrichtungen
CREATE INDEX IF NOT EXISTS idx_org_members_user_org
  ON organization_members (user_id, org_id);
