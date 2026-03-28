import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Pre-built sequence templates — aligned with Plan of Attack §4.1
// "The timing and structure should be opinionated — this is based on
// what works, not what the host 'feels like' sending."
//
// COMPLIANCE: Every email MUST include:
// 1. Unsubscribe link: {{unsubscribe_url}}
// 2. Physical mailing address: {{mailing_address}}
// 3. Clear identification of the sender (host/property name)
const STARTER_SEQUENCES = [
  {
    name: 'Post-Stay Thank You + Review',
    trigger_type: 'post_checkout',
    steps: [
      {
        step_order: 1,
        delay_hours: 24,
        subject: 'Thanks for staying at {{property_name}}!',
        body_template: 'Hi {{guest_name}},\n\nThank you for staying with us at {{property_name}}. We hope you had a wonderful time in {{property_city}}!\n\nIf you enjoyed your stay, we\'d really appreciate a review — it helps other travelers discover our property.\n\nWarm regards,\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
      {
        step_order: 2,
        delay_hours: 168,
        subject: 'How was {{property_city}}?',
        body_template: 'Hi {{guest_name}},\n\nIt\'s been a week since your stay at {{property_name}}. We\'d love to hear about your experience!\n\nTake 60 seconds to share what you enjoyed most — your feedback helps us improve and helps future guests know what to expect.\n\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
    ],
  },
  {
    name: '30-Day Win-Back',
    trigger_type: 'winback_30d',
    steps: [
      {
        step_order: 1,
        delay_hours: 720,
        subject: 'Missing {{property_city}}? We saved your spot.',
        body_template: 'Hi {{guest_name}},\n\nIt\'s been a month since your visit to {{property_name}}. {{property_city}} misses you!\n\nWe have some great dates coming up and wanted to make sure you had first pick. Book directly through us and enjoy 10% off your next stay.\n\nView availability: {{direct_booking_url}}\n\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
    ],
  },
  {
    name: '60-Day Something New',
    trigger_type: 'winback_60d',
    steps: [
      {
        step_order: 1,
        delay_hours: 1440,
        subject: 'Something new at {{property_name}}',
        body_template: 'Hi {{guest_name}},\n\nWe\'ve been making some updates at {{property_name}} and thought you\'d want to know!\n\n{{property_updates}}\n\nWe\'d love to welcome you back to experience the improvements. Your next stay is just a click away.\n\nBook your return: {{direct_booking_url}}\n\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
    ],
  },
  {
    name: '90-Day Seasonal Win-Back',
    trigger_type: 'winback_90d',
    steps: [
      {
        step_order: 1,
        delay_hours: 2160,
        subject: '{{season}} in {{property_city}} is calling',
        body_template: 'Hi {{guest_name}},\n\n{{property_city}} is beautiful this time of year, and we\'d love to welcome you back to {{property_name}}.\n\nFor returning guests, we\'re offering 15% off stays booked this week. It\'s our way of saying thanks for being part of our guest family.\n\nClaim your offer: {{direct_booking_url}}?promo={{promo_code}}\n\nHope to see you soon,\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
    ],
  },
  {
    name: 'Stay Anniversary',
    trigger_type: 'anniversary',
    steps: [
      {
        step_order: 1,
        delay_hours: 8760,
        subject: 'One year ago today...',
        body_template: 'Hi {{guest_name}},\n\nExactly one year ago, you checked in at {{property_name}}. We still remember having you!\n\nReady for round two? We\'d love to host you again. As an anniversary gift, here\'s 15% off your next stay — just book within the next 7 days.\n\nRebook your stay: {{direct_booking_url}}?promo={{promo_code}}\n\nCheers,\n{{host_name}}\n\n---\n{{mailing_address}}\nUnsubscribe: {{unsubscribe_url}}'
      },
    ],
  },
];

// GET /api/sequences
export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const { data: sequences } = await supabase
    .from('email_sequences')
    .select('*, email_sequence_steps(*)')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: true });

  // Get send stats
  const { data: sends } = await supabase
    .from('email_sends')
    .select('status')
    .eq('organization_id', org.id);

  const stats = {
    total: sends?.length || 0,
    sent: sends?.filter(s => s.status === 'sent' || s.status === 'delivered').length || 0,
    opened: sends?.filter(s => s.status === 'opened' || s.status === 'clicked').length || 0,
    clicked: sends?.filter(s => s.status === 'clicked').length || 0,
    bounced: sends?.filter(s => s.status === 'bounced').length || 0,
  };

  return NextResponse.json({ sequences: sequences || [], starters: STARTER_SEQUENCES, stats });
}

// POST /api/sequences — create a sequence from a starter template
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const body = await request.json();
  const { name, trigger_type, steps } = body;

  if (!name || !trigger_type || !steps?.length) {
    return NextResponse.json({ error: 'Name, trigger_type, and steps are required' }, { status: 400 });
  }

  // Create the sequence
  const { data: sequence, error: seqErr } = await supabase
    .from('email_sequences')
    .insert({ organization_id: org.id, name, trigger_type })
    .select()
    .single();

  if (seqErr) return NextResponse.json({ error: seqErr.message }, { status: 500 });

  // Create the steps
  const stepInserts = steps.map((step: { step_order: number; delay_hours: number; subject?: string; body_template: string }) => ({
    sequence_id: sequence.id,
    step_order: step.step_order,
    delay_hours: step.delay_hours,
    subject: step.subject || null,
    body_template: step.body_template,
  }));

  const { error: stepsErr } = await supabase
    .from('email_sequence_steps')
    .insert(stepInserts);

  if (stepsErr) return NextResponse.json({ error: stepsErr.message }, { status: 500 });

  return NextResponse.json(sequence, { status: 201 });
}

// PATCH /api/sequences — toggle active
export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, is_active } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { data, error } = await supabase
    .from('email_sequences')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
