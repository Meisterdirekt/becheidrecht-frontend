-- ============================================
-- Free-Tier: 2 kostenlose Test-Analysen fuer neue User
-- ============================================
-- Aendert handle_new_user() damit neue Registrierungen
-- automatisch 2 Analysen bekommen statt 0.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- User-Subscription anlegen (free, 2 Test-Analysen)
  INSERT INTO public.user_subscriptions (
    user_id, email, subscription_type, status,
    analyses_total, analyses_used, analyses_remaining
  )
  VALUES (NEW.id, NEW.email, 'free', 'active', 2, 0, 2)
  ON CONFLICT (user_id) DO NOTHING;

  -- Profil anlegen
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
