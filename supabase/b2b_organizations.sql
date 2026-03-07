-- ============================================================
-- BESCHEIDRECHT B2B — Organisations-System
-- Art. 28 DSGVO-konformes Multi-User-System für Einrichtungen
-- ============================================================
-- Reihenfolge: organizations → organization_members → organization_invites

-- ============================================================
-- 1. Hilfs-Funktionen (kein RLS-Rekursions-Problem)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = org_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = org_uuid AND user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 2. organizations — Einrichtungs-Stammdaten + Analyse-Pool
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stammdaten
  name TEXT NOT NULL,
  org_type TEXT NOT NULL DEFAULT 'sozialeinrichtung'
    CHECK (org_type IN (
      'caritas', 'diakonie', 'vdk', 'sovd', 'awo', 'drk',
      'schuldnerberatung', 'migrationsberatung', 'jobcenter',
      'sozialeinrichtung', 'sonstige'
    )),

  -- Kontakt
  contact_email TEXT NOT NULL,

  -- B2B-Plan
  subscription_type TEXT NOT NULL DEFAULT 'b2b_starter'
    CHECK (subscription_type IN (
      'b2b_starter', 'b2b_professional', 'b2b_enterprise', 'b2b_corporate'
    )),

  -- Analyse-Pool (geteilt für alle Mitglieder)
  analyses_total   INTEGER NOT NULL DEFAULT 0,
  analyses_used    INTEGER NOT NULL DEFAULT 0,

  -- Laufzeit
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Mitglieder können ihre eigene Einrichtung sehen
CREATE POLICY "org_members_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id));

-- Service Role hat vollen Zugriff (alle Admin-Operationen laufen serverseitig)
CREATE POLICY "service_role_full_orgs" ON public.organizations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION public.update_org_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_org_updated_at();

CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(org_type);

-- ============================================================
-- 3. organization_members — Mitglieder + Nutzungsstatistik
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  org_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Denormalisiert für schnelle Anzeige (kein Auth-User-Join nötig)
  user_email TEXT NOT NULL,

  -- Rolle
  role TEXT NOT NULL DEFAULT 'berater'
    CHECK (role IN ('admin', 'berater')),

  -- Nutzungsstatistik (pro Mitglied)
  analyses_used INTEGER NOT NULL DEFAULT 0,

  -- Einladungs-Audit
  invited_by UUID REFERENCES auth.users(id),

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Jedes Mitglied sieht seine eigene Zugehörigkeit (Client-Side)
-- Vollständige Mitgliederliste wird über Service Role API bereitgestellt
CREATE POLICY "own_membership_visible" ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "service_role_full_members" ON public.organization_members
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id   ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id  ON public.organization_members(user_id);

-- ============================================================
-- 4. organization_invites — Einladungs-Token
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Eingeladene Person
  email TEXT NOT NULL,
  role  TEXT NOT NULL DEFAULT 'berater'
    CHECK (role IN ('admin', 'berater')),

  -- Sicherheits-Token (in URL)
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Audit
  invited_by  UUID REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days',
  accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Pro Org + E-Mail darf nur eine offene Einladung existieren
  UNIQUE(org_id, email)
);

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Nur Service Role (API-Route mit Admin-Check) darf Einladungen verwalten
CREATE POLICY "service_role_full_invites" ON public.organization_invites
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_org_invites_token  ON public.organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON public.organization_invites(org_id);

-- ============================================================
-- FERTIG
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'B2B-Organisations-Tabellen erfolgreich erstellt: organizations, organization_members, organization_invites';
END $$;
