-- ═══════════════════════════════════════════════════════════════════════════════
-- StaySteward Schema — Migration 004
-- Compliance-First Architecture
-- Adds: compliance fields on guests, compliance_config on organizations,
--        rental_agreements table, unsubscribe tokens, message templates
-- Aligns with Plan of Attack §1.1 "Legal-First Data Capture Positioning"
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Compliance fields on guests ────────────────────────────────────────────
-- Track the multi-step compliance flow: ID verification → rental agreement → emergency contact

ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_verified boolean NOT NULL DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_verified_at timestamptz;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_document_type text CHECK (id_document_type IN ('drivers_license', 'passport', 'national_id', 'other'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS emergency_phone text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS rental_agreement_accepted boolean NOT NULL DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS rental_agreement_accepted_at timestamptz;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS rental_agreement_ip inet;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS checkin_completed_at timestamptz;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE;

-- Generate unsubscribe tokens for existing guests
UPDATE guests SET unsubscribe_token = encode(gen_random_uuid()::text::bytea, 'hex')
WHERE unsubscribe_token IS NULL AND email IS NOT NULL;

-- ─── Compliance config on organizations ─────────────────────────────────────
-- Per-org settings for compliance requirements (varies by jurisdiction)

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS compliance_config jsonb NOT NULL DEFAULT '{
  "require_id_verification": false,
  "require_rental_agreement": true,
  "require_emergency_contact": false,
  "gdpr_mode": false,
  "default_house_rules": "",
  "physical_mailing_address": "",
  "compliance_message_template": "default"
}';

-- ─── Rental agreements table ────────────────────────────────────────────────
-- Stores the actual agreement text and guest acceptance records

CREATE TABLE IF NOT EXISTS rental_agreements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id     uuid REFERENCES properties(id) ON DELETE SET NULL,
  title           text NOT NULL DEFAULT 'Rental Agreement & House Rules',
  body_text       text NOT NULL,
  version         integer NOT NULL DEFAULT 1,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rental_agreements_org_access" ON rental_agreements
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ─── Guest agreement acceptances ────────────────────────────────────────────
-- Audit trail of which guest accepted which agreement version

CREATE TABLE IF NOT EXISTS agreement_acceptances (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id            uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  rental_agreement_id uuid NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  accepted_at         timestamptz NOT NULL DEFAULT now(),
  ip_address          inet,
  user_agent          text,
  UNIQUE(guest_id, rental_agreement_id)
);

ALTER TABLE agreement_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agreement_acceptances_org_access" ON agreement_acceptances
  FOR ALL USING (
    guest_id IN (
      SELECT id FROM guests WHERE organization_id IN (
        SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
      )
    )
  );

-- ─── Compliance message templates ───────────────────────────────────────────
-- Pre-approved Airbnb-safe messaging templates hosts can use

CREATE TABLE IF NOT EXISTS compliance_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  category        text NOT NULL CHECK (category IN ('checkin_link', 'pre_arrival', 'post_checkout', 'review_request', 'custom')),
  message_text    text NOT NULL,
  platform        text NOT NULL DEFAULT 'all' CHECK (platform IN ('airbnb', 'vrbo', 'booking', 'direct', 'all')),
  is_system       boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;

-- System templates visible to all, org templates visible to owner
CREATE POLICY "compliance_templates_access" ON compliance_templates
  FOR ALL USING (
    is_system = true OR
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ─── Insert system-level Airbnb-safe message templates ──────────────────────
-- Based on Plan of Attack §1.2

INSERT INTO compliance_templates (name, category, message_text, platform, is_system) VALUES
(
  'Standard Check-In Link (Airbnb)',
  'checkin_link',
  'Hi {{guest_name}}! We''re looking forward to hosting you at {{property_name}}. To prepare for your arrival, please complete your digital check-in here: {{portal_link}}. This will give you access to your door code, WiFi password, parking details, and local area information. If you have any questions before your stay, don''t hesitate to reach out!',
  'airbnb',
  true
),
(
  'Standard Check-In Link (Booking.com)',
  'checkin_link',
  'Welcome! Your digital check-in for {{property_name}} is ready: {{portal_link}}. You''ll find everything you need for a smooth arrival — door access, WiFi, parking, and local tips. See you soon!',
  'booking',
  true
),
(
  'Standard Check-In Link (VRBO)',
  'checkin_link',
  'Hi {{guest_name}}! Your stay at {{property_name}} is coming up. Complete your digital check-in for instant access to your door code, WiFi, and property guide: {{portal_link}}. Looking forward to hosting you!',
  'vrbo',
  true
),
(
  'Pre-Arrival Reminder',
  'pre_arrival',
  'Hi {{guest_name}}, just a friendly reminder to complete your digital check-in for {{property_name}} before you arrive: {{portal_link}}. This ensures everything is ready for a smooth arrival. Safe travels!',
  'all',
  true
),
(
  'Standard Check-In Link (Direct)',
  'checkin_link',
  'Hi {{guest_name}}! We''re excited to welcome you to {{property_name}}. Your personalized guest portal is ready: {{portal_link}}. Complete your check-in to access your door code, WiFi, house guide, and exclusive local recommendations. We can''t wait to host you!',
  'direct',
  true
);

-- ─── Triggers ───────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_rental_agreements BEFORE UPDATE ON rental_agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_compliance_templates BEFORE UPDATE ON compliance_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_guests_unsubscribe ON guests(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rental_agreements_org ON rental_agreements(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_templates_org ON compliance_templates(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_templates_system ON compliance_templates(is_system) WHERE is_system = true;
