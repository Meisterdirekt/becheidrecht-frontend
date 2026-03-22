-- ============================================
-- Verwaiste Tabellen entfernen
-- Alle 0 Rows, kein Code referenziert sie in Business-Logik.
-- ============================================

-- analyses: 0 Rows, nur im backend-health als Table-Check (bereits entfernt)
-- Nicht verwechseln mit analysis_results (das ist die aktive Tabelle)
DROP TABLE IF EXISTS public.analyses CASCADE;

-- usage: 0 Rows, kein Code
DROP TABLE IF EXISTS public.usage CASCADE;

-- subscriptions: 0 Rows, ersetzt durch user_subscriptions
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- single_purchases: 0 Rows, B2C entfernt seit 12.03.2026
DROP TABLE IF EXISTS public.single_purchases CASCADE;

-- documents: 0 Rows, kein Code schreibt rein
DROP TABLE IF EXISTS public.documents CASCADE;

-- sessions: 0 Rows, analysis_results.session_id ist immer NULL
-- Geplant aber nie integriert — entfernen statt Altlast mitschleppen
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Social-Media Tabellen: nie genutzt, 0 Rows (ausser social_topics mit 37 Rows — bleibt)
DROP TABLE IF EXISTS public.social_accounts CASCADE;
DROP TABLE IF EXISTS public.social_content CASCADE;
DROP TABLE IF EXISTS public.social_posts CASCADE;
DROP TABLE IF EXISTS public.social_schedule CASCADE;

-- ============================================
-- BEHALTEN (mit Begruendung):
-- social_topics (37 Rows, Content-Pipeline)
-- weisungen (0 Rows, aber AG04 nutzt die Tabelle bei Bedarf)
-- ============================================
