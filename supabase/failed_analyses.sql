-- Failed Analyses Tabelle
-- Speichert fehlgeschlagene Analysen fuer Debugging und Monitoring.
--
-- DEPLOY: Manuell im Supabase SQL-Editor ausfuehren.

CREATE TABLE IF NOT EXISTS public.failed_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_context TEXT,
  file_count INTEGER DEFAULT 1,
  file_types TEXT[],
  text_length INTEGER DEFAULT 0,
  pipeline_phase TEXT,  -- 'upload' | 'extraction' | 'security' | 'triage' | 'analyse' | 'brief'
  agent_name TEXT,      -- z.B. 'AG01', 'AG02', etc.
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index fuer Zeitraum-Abfragen (Monitoring, Retention)
CREATE INDEX IF NOT EXISTS idx_failed_analyses_created_at ON public.failed_analyses (created_at DESC);

-- RLS aktivieren
ALTER TABLE public.failed_analyses ENABLE ROW LEVEL SECURITY;

-- Nur Service-Role darf lesen/schreiben (kein User-Zugriff)
CREATE POLICY "Service role full access" ON public.failed_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Retention: In data-retention Cron nach 90 Tagen loeschen
-- (muss manuell in data-retention/route.ts ergaenzt werden)
