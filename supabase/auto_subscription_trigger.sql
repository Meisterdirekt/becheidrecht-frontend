-- Auto-Subscription Trigger
-- Erstellt automatisch einen user_subscriptions Eintrag wenn ein neuer User sich registriert.
-- Verhindert das Problem dass Mollie-Webhooks keinen User finden (pending_registration).
--
-- DEPLOY: Manuell im Supabase SQL-Editor ausfuehren.

-- Funktion: Wird nach jedem neuen Auth-User aufgerufen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    email,
    subscription_type,
    status,
    analyses_total,
    analyses_remaining,
    analyses_used,
    payment_method,
    purchased_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'free',
    'free',
    0,
    0,
    0,
    'registration',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Idempotent: kein Fehler bei doppeltem Aufruf

  RETURN NEW;
END;
$$;

-- Trigger: Nach jedem INSERT in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: Bestehende User ohne Subscription-Eintrag nachtraeglich anlegen
INSERT INTO public.user_subscriptions (user_id, email, subscription_type, status, analyses_total, analyses_remaining, analyses_used, payment_method, purchased_at, updated_at)
SELECT
  u.id,
  COALESCE(u.email, ''),
  'free',
  'free',
  0,
  0,
  0,
  'registration',
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.user_subscriptions us ON us.user_id = u.id
WHERE us.user_id IS NULL;
