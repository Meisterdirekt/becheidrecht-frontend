-- BescheidRecht — RLS Fix für plans + single_purchases
-- Ausführen im Supabase SQL-Editor:
-- Dashboard → SQL Editor → New Query → einfügen → Run

-- ---------------------------------------------------------------------------
-- 1. plans — Preispläne (öffentlich lesbar, nur Service-Role schreibt)
-- ---------------------------------------------------------------------------

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Public read plans'
  ) THEN
    CREATE POLICY "Public read plans"
      ON public.plans FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Service write plans'
  ) THEN
    CREATE POLICY "Service write plans"
      ON public.plans FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. single_purchases — Einzelkäufe pro User
-- ---------------------------------------------------------------------------

ALTER TABLE public.single_purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'single_purchases' AND policyname = 'Users read own purchases'
  ) THEN
    CREATE POLICY "Users read own purchases"
      ON public.single_purchases FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'single_purchases' AND policyname = 'Service full access single_purchases'
  ) THEN
    CREATE POLICY "Service full access single_purchases"
      ON public.single_purchases FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
