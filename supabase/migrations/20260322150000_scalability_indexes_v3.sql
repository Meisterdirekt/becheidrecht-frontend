-- Skalierbarkeits-Indizes v3: Fehlende Indizes aus Query-Pattern-Analyse
-- Datum: 2026-03-22

-- 1. user_subscriptions: häufig per user_id + status abgefragt (subscription-status, use-analysis)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
  ON user_subscriptions (user_id, status);

-- 2. analysis_results: user_id Filter (account/export, feedback) — bestehend nur rechtsgebiet + user_created
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id
  ON analysis_results (user_id);

-- 3. usage_counters: per user_id abgefragt (use-analysis)
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_id
  ON usage_counters (user_id);

-- 4. usage_counters: per period + user_id abgefragt (monatliche Nutzung)
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_period
  ON usage_counters (user_id, period);

-- 5. demo_requests: created_at DESC für Admin-Liste + status-Filter
CREATE INDEX IF NOT EXISTS idx_demo_requests_created
  ON demo_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_requests_status
  ON demo_requests (status);

-- 6. site_feedback: created_at DESC für Admin-Liste
CREATE INDEX IF NOT EXISTS idx_site_feedback_created
  ON site_feedback (created_at DESC);

-- 7. organization_invites: org_id + email für Duplikat-Check
CREATE INDEX IF NOT EXISTS idx_org_invites_org_email
  ON organization_invites (org_id, email);

-- 8. profiles: id ist PK, kein Extra-Index nötig
-- 9. plans: name ist klein (<10 Rows), kein Index nötig
