import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { ActivityType } from '@/types/leads';

// GET /api/leads/[id]/activities — Get activities for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  // Verify lead exists and belongs to user's org
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('id', id)
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .single();
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const { data: activities, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activities: activities || [] });
}

// POST /api/leads/[id]/activities — Create a new activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  // Verify lead exists and belongs to user's org
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id')
    .eq('id', id)
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .single();
  if (leadError || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const body = await request.json();
  const { activity_type, title, description, metadata } = body;

  // Validate required fields
  if (!activity_type || !title) {
    return NextResponse.json(
      { error: 'activity_type and title are required' },
      { status: 400 }
    );
  }

  // Validate activity_type
  const validTypes: ActivityType[] = ['note', 'email_sent', 'email_received', 'call', 'meeting', 'demo', 'proposal', 'status_change', 'research', 'import'];
  if (!validTypes.includes(activity_type)) {
    return NextResponse.json(
      { error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    );
  }

  const { data: activity, error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: id,
      organization_id: org.id,
      activity_type,
      title,
      description: description || null,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(activity, { status: 201 });
}
