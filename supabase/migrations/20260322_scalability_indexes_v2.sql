-- Skalierbarkeits-Indizes v2: Fehlende Indizes + Redundanz-Bereinigung
-- Datum: 2026-03-22

-- 1. Fristen: Status + Datum für Cron-Reminder (Query ohne user_id-Filter)
CREATE INDEX IF NOT EXISTS idx_user_fristen_status_datum
  ON user_fristen (status, frist_datum);

-- 2. Org-Einladungen: Cleanup abgelaufener Einladungen
CREATE INDEX IF NOT EXISTS idx_org_invites_expires
  ON organization_invites (expires_at, accepted_at);

-- 3. Redundante Indizes entfernen (werden durch Composite-Indizes abgedeckt)
-- user_fristen_user_id_idx ist Subset von idx_user_fristen_user_status (user_id, status, frist_datum)
DROP INDEX IF EXISTS user_fristen_user_id_idx;
-- idx_org_members_user_id ist Subset von idx_org_members_user_org (user_id, org_id)
DROP INDEX IF EXISTS idx_org_members_user_id;
