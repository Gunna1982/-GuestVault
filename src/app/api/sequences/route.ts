import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Pre-built sequence templates hosts can activate
const STARTER_SEQUENCES = [
  {
    name: 'Post-Stay Thank You + Review',
    trigger_type: 'post_checkout',
    steps: [
      { step_order: 1, delay_hours: 24, subject: 'Thank you for staying at {{property_name}}!', body_template: 'Hi {{guest_name}},\n\nThank you for choosing to stay with us at {{property_name}}. We hope you had a wonderful time!\n\nIf you enjoyed your stay, we\'d really appreciate a review — it helps other travelers find us.\n\nWe\'d love to host you again. Book direct next time and save 10%.\n\nWarm regards,\n{{host_name}}' },
      { step_order: 2, delay_hours: 168, subject: 'How was your stay at {{property_name}}?', body_template: 'Hi {{guest_name}},\n\nIt\'s been a week since your stay at {{property_name}}. We hope the memories are still fresh!\n\nIf you haven\'t had a chance yet, a quick review would mean the world to us.\n\nAlready planning your next trip? Book direct and save 10%.\n\n{{host_name}}' },
    ],
  },
  {
    name: '30-Day Win-Back',
    trigger_type: 'winback_30d',
    steps: [
      { step_order: 1, delay_hours: 720, subject: 'Missing {{property_city}}? Come back and save', body_template: 'Hi {{guest_name}},\n\nIt\'s been a month since you stayed at {{property_name}}. We hope you\'re doing well!\n\nReady for another getaway? Book direct and enjoy 15% off your next stay.\n\nUse code WELCOME15 at checkout.\n\n{{host_name}}' },
    ],
  },
  {
    name: '90-Day Win-Back',
    trigger_type: 'winback_90d',
    steps: [
      { step_order: 1, delay_hours: 2160, subject: '{{property_city}} is calling — special offer inside', body_template: 'Hi {{guest_name}},\n\nIt\'s been a few months since your visit to {{property_name}}. {{property_city}} is beautiful this time of year!\n\nWe\'d love to welcome you back with 20% off your next stay. Book direct — no platform fees.\n\nUse code COMEBACK20.\n\n{{host_name}}' },
    ],
  },
  {
    name: 'Stay Anniversary',
    trigger_type: 'anniversary',
    steps: [
      { step_order: 1, delay_hours: 8760, subject: 'One year ago today — {{property_name}}', body_template: 'Hi {{guest_name}},\n\nExactly one year ago today, you stayed at {{property_name}}. Time flies!\n\nWe\'d love to host you again. Here\'s a special anniversary offer — 15% off if you book within the next 7 days.\n\nBook direct: {{direct_booking_url}}\n\n{{host_name}}' },
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
