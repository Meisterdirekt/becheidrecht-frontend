-- ============================================
-- plans-Tabelle mit aktuellen B2B-Plaenen synchronisieren
-- App nutzt PLAN_CONFIG (TypeScript) als Source of Truth,
-- DB sollte aber konsistent sein fuer Admin-Queries.
-- ============================================

-- CHECK Constraint erweitern um 'b2b' Typ
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_type_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_type_check
  CHECK (type IN ('single', 'subscription', 'b2b'));

-- B2B-Plaene einfuegen
INSERT INTO public.plans (name, price_eur, document_limit, type)
VALUES
  ('B2B Starter',      199.00, 300,  'b2b'),
  ('B2B Professional', 399.00, 1000, 'b2b'),
  ('B2B Enterprise',   699.00, 2500, 'b2b'),
  ('B2B Corporate',    0.00,   6000, 'b2b')
ON CONFLICT DO NOTHING;
