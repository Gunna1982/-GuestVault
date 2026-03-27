-- ═══════════════════════════════════════════════════════════════════════════════
-- GuestVault Schema — Migration 002
-- Tables: upsell_templates, property_upsells, upsell_orders
-- RLS: enabled, org-level isolation
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Upsell Templates ────────────────────────────────────────────────────────

CREATE TABLE upsell_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category        text NOT NULL DEFAULT 'custom' CHECK (category IN ('checkout','transport','grocery','cleaning','experience','equipment','chef','custom')),
  name            text NOT NULL,
  description     text,
  image_url       text,
  price_cents     integer NOT NULL,
  price_type      text NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed','per_person','per_night')),
  currency        text NOT NULL DEFAULT 'USD',
  host_revenue_pct decimal(5,2) NOT NULL DEFAULT 100,
  requires_lead_time integer,
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

ALTER TABLE upsell_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upsell_templates_org_access" ON upsell_templates
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ─── Property Upsells (junction) ─────────────────────────────────────────────

CREATE TABLE property_upsells (
  property_id       uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  upsell_template_id uuid NOT NULL REFERENCES upsell_templates(id) ON DELETE CASCADE,
  override_price    integer,
  is_active         boolean NOT NULL DEFAULT true,
  PRIMARY KEY (property_id, upsell_template_id)
);

ALTER TABLE property_upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_upsells_org_access" ON property_upsells
  FOR ALL USING (
    property_id IN (
      SELECT id FROM properties WHERE deleted_at IS NULL AND organization_id IN (
        SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
      )
    )
  );

-- ─── Upsell Orders ───────────────────────────────────────────────────────────

CREATE TABLE upsell_orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_id      uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  guest_id            uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  upsell_template_id  uuid NOT NULL REFERENCES upsell_templates(id),
  quantity            integer NOT NULL DEFAULT 1,
  amount_cents        integer NOT NULL,
  platform_fee_cents  integer NOT NULL DEFAULT 0,
  host_payout_cents   integer NOT NULL,
  stripe_payment_id   text,
  stripe_transfer_id  text,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','fulfilled','refunded','failed')),
  fulfilled_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

ALTER TABLE upsell_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upsell_orders_org_access" ON upsell_orders
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Allow guest portal to create orders (no auth.uid() — uses service role via API)
CREATE POLICY "upsell_orders_guest_insert" ON upsell_orders
  FOR INSERT WITH CHECK (true);

-- ─── Triggers ────────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at_upsell_templates BEFORE UPDATE ON upsell_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_upsell_orders BEFORE UPDATE ON upsell_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
