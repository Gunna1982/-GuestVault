-- ═══════════════════════════════════════════════════════════════════════════════
-- GuestVault Core Schema — Migration 001
-- Tables: organizations, properties, reservations, guests
-- RLS: enabled on all tables, policies enforce org-level isolation
-- All tables include deleted_at for GDPR soft-delete compliance
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Organizations ───────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','growth','pro','enterprise')),
  stripe_account_id text,
  custom_domain text,
  brand_config  jsonb NOT NULL DEFAULT '{"primary_color":"#C9A84C"}',
  settings      jsonb NOT NULL DEFAULT '{"timezone":"America/New_York","currency":"USD"}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz          -- GDPR soft delete
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Owner can do everything on their org (exclude soft-deleted)
CREATE POLICY "org_owner_all" ON organizations
  FOR ALL USING (owner_user_id = auth.uid() AND deleted_at IS NULL);

-- ─── Properties ──────────────────────────────────────────────────────────────

CREATE TABLE properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL,
  address         jsonb,
  description     text,
  images          jsonb NOT NULL DEFAULT '[]',
  property_info   jsonb NOT NULL DEFAULT '{}',
  pms_source      text,
  pms_external_id text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  UNIQUE(organization_id, slug)
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Users can access properties belonging to their org
CREATE POLICY "properties_org_access" ON properties
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ─── Reservations ────────────────────────────────────────────────────────────

CREATE TABLE reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  pms_external_id text,
  channel         text CHECK (channel IN ('airbnb','vrbo','direct','booking')),
  check_in        date NOT NULL,
  check_out       date NOT NULL,
  guest_count     integer,
  total_amount    decimal(10,2),
  currency        text NOT NULL DEFAULT 'USD',
  status          text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','checked_in','checked_out','cancelled')),
  portal_token    text UNIQUE,
  portal_accessed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_org_access" ON reservations
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ─── Guests ──────────────────────────────────────────────────────────────────

CREATE TABLE guests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_id  uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  email           text,
  email_verified  boolean NOT NULL DEFAULT false,
  phone           text,
  first_name      text,
  last_name       text,
  is_primary      boolean NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz,
  consent_ip      inet,
  source          text NOT NULL DEFAULT 'check_in_portal' CHECK (source IN ('check_in_portal','pms_sync','wifi','manual')),
  tags            text[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guests_org_access" ON guests
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE INDEX idx_guests_org_email ON guests(organization_id, email);

-- ─── Updated-at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_properties BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_reservations BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_guests BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
