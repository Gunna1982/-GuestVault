-- ═══════════════════════════════════════════════════════════════════════════════
-- StaySteward Schema — Migration 003
-- Tables: email_sequences, email_sequence_steps, email_sends
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE email_sequences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  trigger_type    text NOT NULL DEFAULT 'post_checkout' CHECK (trigger_type IN ('post_checkout','post_booking','anniversary','winback_30d','winback_60d','winback_90d','seasonal','manual')),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_sequences_org_access" ON email_sequences
  FOR ALL USING (
    deleted_at IS NULL AND
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE TABLE email_sequence_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     uuid NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_order      integer NOT NULL,
  delay_hours     integer NOT NULL,
  channel         text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms')),
  subject         text,
  body_template   text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_sequence_steps_access" ON email_sequence_steps
  FOR ALL USING (
    sequence_id IN (
      SELECT id FROM email_sequences WHERE deleted_at IS NULL AND organization_id IN (
        SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
      )
    )
  );

CREATE TABLE email_sends (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guest_id          uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  sequence_step_id  uuid REFERENCES email_sequence_steps(id),
  channel           text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms')),
  status            text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','opened','clicked','bounced','failed','unsubscribed')),
  resend_message_id text,
  sent_at           timestamptz,
  opened_at         timestamptz,
  clicked_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_sends_org_access" ON email_sends
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE INDEX idx_email_sends_guest ON email_sends(guest_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);

CREATE TRIGGER set_updated_at_email_sequences BEFORE UPDATE ON email_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_email_sequence_steps BEFORE UPDATE ON email_sequence_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_email_sends BEFORE UPDATE ON email_sends FOR EACH ROW EXECUTE FUNCTION update_updated_at();
