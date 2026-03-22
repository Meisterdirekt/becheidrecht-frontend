-- ============================================
-- profiles-Tabelle: Schema definieren + Auto-Create Trigger
-- Export/Delete-Routes referenzieren profiles, Tabelle ist leer.
-- ============================================

-- Tabelle existiert moeglicherweise schon (Supabase Default), daher IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User kann eigenes Profil lesen
DO $$ BEGIN
  CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service Role hat vollen Zugriff
DO $$ BEGIN
  CREATE POLICY "Service role full access profiles"
    ON public.profiles FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Updated-at Trigger (Funktion existiert bereits aus user_subscriptions)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- handle_new_user() erweitern: auch profiles erstellen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- User-Subscription anlegen (free)
  INSERT INTO public.user_subscriptions (
    user_id, email, subscription_type, status,
    analyses_total, analyses_used, analyses_remaining
  )
  VALUES (NEW.id, NEW.email, 'free', 'active', 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Profil anlegen
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bestehende User ohne Profil nachtraeglich hinzufuegen
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
