-- ============================================================
-- B2B Organisations-System (idempotent)
-- Erstellt organizations, organization_members, organization_invites
-- ============================================================

-- 1. organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_type TEXT NOT NULL DEFAULT 'sozialeinrichtung'
    CHECK (org_type IN (
      'caritas', 'diakonie', 'vdk', 'sovd', 'awo', 'drk',
      'schuldnerberatung', 'migrationsberatung', 'jobcenter',
      'sozialeinrichtung', 'sonstige'
    )),
  contact_email TEXT NOT NULL,
  subscription_type TEXT NOT NULL DEFAULT 'b2b_starter'
    CHECK (subscription_type IN (
      'b2b_starter', 'b2b_professional', 'b2b_enterprise', 'b2b_corporate'
    )),
  analyses_total   INTEGER NOT NULL DEFAULT 0,
  analyses_used    INTEGER NOT NULL DEFAULT 0,
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_org_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_org_updated_at();

CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(org_type);

-- 2. organization_members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'berater'
    CHECK (role IN ('admin', 'berater')),
  analyses_used INTEGER NOT NULL DEFAULT 0,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "own_membership_visible" ON public.organization_members
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_members" ON public.organization_members
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_org_members_org_id   ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id  ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_org ON public.organization_members(user_id, org_id);

-- 3. Hilfs-Funktionen
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

-- Organizations RLS (braucht is_org_member)
DO $$ BEGIN
  CREATE POLICY "org_members_select" ON public.organizations
    FOR SELECT TO authenticated
    USING (public.is_org_member(id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_orgs" ON public.organizations
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. organization_invites
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role  TEXT NOT NULL DEFAULT 'berater'
    CHECK (role IN ('admin', 'berater')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by  UUID REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "service_role_full_invites" ON public.organization_invites
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_org_invites_token  ON public.organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON public.organization_invites(org_id);
