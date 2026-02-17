-- ============================================
-- BESCHEIDRECHT - USER SUBSCRIPTIONS TABELLE
-- ============================================
-- Diese Tabelle speichert die Abo-Informationen der User

-- 1. Haupttabelle erstellen
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- Abo-Typ
  subscription_type TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_type IN (
      'free',           -- Kostenloser Account (keine Analysen)
      'single',         -- Einzelkauf (19,90€ → 1 Analyse)
      'basic',          -- Basic (19,90€/Monat → 5 Analysen)
      'standard',       -- Standard (49,90€/Monat → 15 Analysen)
      'pro',            -- Pro (129€/Monat → 50 Analysen)
      'business',       -- Business (249€/Monat → 120 Analysen)
      'b2b_starter',    -- B2B Starter (2.490€/Jahr)
      'b2b_professional', -- B2B Professional (6.990€/Jahr)
      'b2b_enterprise', -- B2B Enterprise (14.990€/Jahr)
      'b2b_corporate'   -- B2B Corporate (29.990€/Jahr)
    )),

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired')),

  -- Analysen-Counter
  analyses_total INTEGER NOT NULL DEFAULT 0,      -- Gesamt gekaufte Analysen
  analyses_used INTEGER NOT NULL DEFAULT 0,       -- Bereits genutzte Analysen
  analyses_remaining INTEGER NOT NULL DEFAULT 0,  -- Verbleibende Analysen

  -- Zahlungsinformationen
  order_id TEXT,                    -- Digistore24 Order-ID
  transaction_id TEXT,              -- Digistore24 Transaction-ID
  payment_method TEXT,              -- z.B. 'digistore24', 'manual'

  -- Zeitstempel
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,  -- Für Abos (monatlich/jährlich)
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email
  ON public.user_subscriptions(email);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_type
  ON public.user_subscriptions(subscription_type);

-- 3. Row Level Security (RLS) aktivieren
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- User kann nur eigene Subscription sehen
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- User kann eigene Subscription nicht ändern (nur via Backend)
-- Verhindert Manipulation durch User

-- Service Role kann alles (für Backend/Admin)
CREATE POLICY "Service role has full access"
  ON public.user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Funktion: Automatisch Subscription erstellen bei User-Registrierung
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- 7. Funktion: Analyse durchführen (Counter reduzieren)
CREATE OR REPLACE FUNCTION use_analysis(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- Prüfen ob noch Analysen verfügbar
  SELECT analyses_remaining INTO v_remaining
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RETURN FALSE; -- Keine Analysen mehr
  END IF;

  -- Counter aktualisieren
  UPDATE public.user_subscriptions
  SET
    analyses_used = analyses_used + 1,
    analyses_remaining = analyses_remaining - 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Funktion: Abo kaufen/upgraden
CREATE OR REPLACE FUNCTION purchase_subscription(
  p_user_id UUID,
  p_subscription_type TEXT,
  p_order_id TEXT DEFAULT NULL,
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_analyses INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Anzahl Analysen je nach Typ festlegen
  CASE p_subscription_type
    WHEN 'single' THEN
      v_analyses := 1;
      v_expires_at := NULL; -- Einzelkauf läuft nicht ab
    WHEN 'basic' THEN
      v_analyses := 5;
      v_expires_at := NOW() + INTERVAL '1 month';
    WHEN 'standard' THEN
      v_analyses := 15;
      v_expires_at := NOW() + INTERVAL '1 month';
    WHEN 'pro' THEN
      v_analyses := 50;
      v_expires_at := NOW() + INTERVAL '1 month';
    WHEN 'business' THEN
      v_analyses := 120;
      v_expires_at := NOW() + INTERVAL '1 month';
    WHEN 'b2b_starter' THEN
      v_analyses := 300;
      v_expires_at := NOW() + INTERVAL '1 year';
    WHEN 'b2b_professional' THEN
      v_analyses := 1000;
      v_expires_at := NOW() + INTERVAL '1 year';
    WHEN 'b2b_enterprise' THEN
      v_analyses := 2500;
      v_expires_at := NOW() + INTERVAL '1 year';
    WHEN 'b2b_corporate' THEN
      v_analyses := 6000;
      v_expires_at := NOW() + INTERVAL '1 year';
    ELSE
      RAISE EXCEPTION 'Invalid subscription type';
  END CASE;

  -- Subscription aktualisieren
  UPDATE public.user_subscriptions
  SET
    subscription_type = p_subscription_type,
    status = 'active',
    analyses_total = v_analyses,
    analyses_remaining = v_analyses,
    analyses_used = 0,
    order_id = p_order_id,
    transaction_id = p_transaction_id,
    payment_method = 'digistore24',
    purchased_at = NOW(),
    expires_at = v_expires_at,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ANLEITUNG ZUM AUSFÜHREN:
-- ============================================
-- 1. Gehen Sie zu: https://supabase.com/dashboard
-- 2. Wählen Sie Ihr Projekt
-- 3. Linke Sidebar: SQL Editor
-- 4. Klicken Sie: "+ New query"
-- 5. Kopieren Sie dieses komplette SQL
-- 6. Klicken Sie: "Run" (oder Strg+Enter)
-- 7. Fertig! ✅

-- ============================================
-- TEST-BEFEHLE (optional):
-- ============================================

-- Alle Subscriptions anzeigen:
-- SELECT * FROM public.user_subscriptions;

-- Eigene Subscription anzeigen (als User):
-- SELECT * FROM public.user_subscriptions WHERE user_id = auth.uid();

-- Manuell ein Abo zuweisen (als Admin/Service):
-- SELECT purchase_subscription(
--   'USER_UUID_HIER',
--   'basic',
--   'ORDER_123',
--   'TRANS_456'
-- );

-- Analyse durchführen (Counter reduzieren):
-- SELECT use_analysis('USER_UUID_HIER');
