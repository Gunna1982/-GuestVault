-- Migration 004: Lead Management System
-- StaySteward CRM for tracking vacation rental operator prospects

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

  -- Company Info
  company_name text NOT NULL,
  brand_name text,
  licensee_name text,

  -- Contact Info
  email text,
  phone text,
  website text,
  contact_person text,

  -- Business Details
  tier text CHECK (tier IN ('enterprise', 'growth', 'starter', 'unknown')) DEFAULT 'unknown',
  estimated_units integer DEFAULT 0,
  license_count integer DEFAULT 0,
  license_type text CHECK (license_type IN ('collective', 'group', 'multiple_individual', 'single', 'unknown')) DEFAULT 'unknown',

  -- Location
  market_area text,
  counties text[],
  cities text[],
  state text DEFAULT 'FL',

  -- Intelligence
  pms_used text,
  current_upsells text,
  tech_sophistication text CHECK (tech_sophistication IN ('very_high', 'high', 'medium_high', 'medium', 'low', 'unknown')) DEFAULT 'unknown',
  guestvault_opportunity text,
  services_offered text,

  -- Source & Enrichment
  source text CHECK (source IN ('dbpr', 'vrma', 'pms_directory', 'google', 'airbnb_vrbo', 'association', 'referral', 'web_research', 'manual')) DEFAULT 'manual',
  source_detail text,
  enrichment_notes text,

  -- Outreach Tracking
  outreach_status text CHECK (outreach_status IN ('not_contacted', 'researching', 'contacted', 'responded', 'demo_scheduled', 'demo_completed', 'proposal_sent', 'negotiating', 'converted', 'lost', 'not_a_fit')) DEFAULT 'not_contacted',
  outreach_priority text CHECK (outreach_priority IN ('tier_1', 'tier_2', 'tier_3', 'monitor', 'none')) DEFAULT 'none',

  -- Outreach Activity
  date_first_contacted timestamptz,
  date_last_contacted timestamptz,
  date_demo_scheduled timestamptz,
  date_converted timestamptz,
  contact_method text,
  response_notes text,

  -- DBPR License Data
  dbpr_license_numbers text[],
  dbpr_rank_code text,
  dbpr_modifier_code text,
  mailing_address text,

  -- Tags & Custom
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================
-- LEAD ACTIVITIES (interaction log)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

  activity_type text NOT NULL CHECK (activity_type IN (
    'note', 'email_sent', 'email_received', 'call', 'meeting',
    'demo', 'proposal', 'status_change', 'research', 'import'
  )),

  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_leads_org ON leads(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_tier ON leads(tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_status ON leads(outreach_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_priority ON leads(outreach_priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_source ON leads(source) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_market ON leads(market_area) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_company ON leads(company_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_pms ON leads(pms_used) WHERE deleted_at IS NULL;
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);

-- Full-text search on company/brand names
CREATE INDEX idx_leads_search ON leads USING gin(
  to_tsvector('english', coalesce(company_name, '') || ' ' || coalesce(brand_name, '') || ' ' || coalesce(licensee_name, ''))
) WHERE deleted_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Leads: org members can read/write their own leads
CREATE POLICY leads_select ON leads FOR SELECT
  USING (deleted_at IS NULL AND (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  ));

CREATE POLICY leads_insert ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY leads_update ON leads FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

-- Lead Activities: same org-level isolation
CREATE POLICY lead_activities_select ON lead_activities FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY lead_activities_insert ON lead_activities FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER VIEW: Lead Pipeline Summary
-- ============================================
CREATE OR REPLACE VIEW lead_pipeline_summary AS
SELECT
  organization_id,
  outreach_status,
  tier,
  outreach_priority,
  COUNT(*) as count,
  AVG(estimated_units) as avg_units
FROM leads
WHERE deleted_at IS NULL
GROUP BY organization_id, outreach_status, tier, outreach_priority;
