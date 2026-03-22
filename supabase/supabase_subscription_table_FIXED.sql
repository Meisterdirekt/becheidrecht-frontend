-- ============================================
-- BESCHEIDRECHT - USER SUBSCRIPTIONS TABELLE
-- ============================================
-- WICHTIG: Dieses Script SCHRITTWEISE ausführen!
-- Falls Fehler auftreten, einzelne Schritte kopieren und ausführen

-- ============================================
-- SCHRITT 1: Alte Tabelle löschen (falls vorhanden)
-- ============================================
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- ============================================
-- SCHRITT 2: Haupttabelle erstellen
-- ============================================
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,

  -- Abo-Typ
  subscription_type TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_type IN (
      'free', 'single', 'basic', 'standard', 'pro', 'business',
      'b2b_starter', 'b2b_professional', 'b2b_enterprise', 'b2b_corporate'
    )),

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired')),

  -- Analysen-Counter
  analyses_total INTEGER NOT NULL DEFAULT 0,
  analyses_used INTEGER NOT NULL DEFAULT 0,
  analyses_remaining INTEGER NOT NULL DEFAULT 0,

  -- Zahlungsinformationen
  order_id TEXT,
  transaction_id TEXT,
  payment_method TEXT,

  -- Zeitstempel
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHRITT 3: Indizes erstellen
-- ============================================
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_email ON public.user_subscriptions(email);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_type ON public.user_subscriptions(subscription_type);

-- ============================================
-- SCHRITT 4: Row Level Security aktivieren
-- ============================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCHRITT 5: RLS Policies erstellen
-- ============================================

-- Policy: User kann nur eigene Subscription sehen
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service Role hat vollen Zugriff
CREATE POLICY "Service role full access"
  ON public.user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SCHRITT 6: Trigger für updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SCHRITT 7: Funktion für automatische User-Subscription
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    email,
    subscription_type,
    status,
    analyses_total,
    analyses_used,
    analyses_remaining
  )
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    'active',
    2,
    0,
    2
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für neue User erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FERTIG! ✅
-- ============================================

-- TEST: Existierende User nachträglich hinzufügen (optional)
-- Falls User bereits existieren, werden sie hier hinzugefügt:
INSERT INTO public.user_subscriptions (user_id, email, subscription_type, status, analyses_total, analyses_used, analyses_remaining)
SELECT
  id,
  email,
  'free',
  'active',
  0,
  0,
  0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ user_subscriptions Tabelle erfolgreich erstellt!';
  RAISE NOTICE '✅ Alle Trigger und Policies sind aktiv!';
  RAISE NOTICE '✅ Bestehende User wurden hinzugefügt!';
END $$;
