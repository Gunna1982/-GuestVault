import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/leads/[id] — Get single lead with activities
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

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .single();

  if (error || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  // Get activities
  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ lead, activities: activities || [] });
}

// PATCH /api/leads/[id] — Update a lead
export async function PATCH(
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

  const body = await request.json();

  // Track status changes
  if (body.outreach_status) {
    const { data: existing } = await supabase
      .from('leads')
      .select('outreach_status, company_name')
      .eq('id', id)
      .single();

    if (existing && existing.outreach_status !== body.outreach_status) {
      await supabase.from('lead_activities').insert({
        lead_id: id,
        organization_id: org.id,
        activity_type: 'status_change',
        title: `Status: ${existing.outreach_status} → ${body.outreach_status}`,
        description: `${existing.company_name} moved to ${body.outreach_status}`,
        metadata: { from: existing.outreach_status, to: body.outreach_status },
      });

      // Auto-set date fields
      if (body.outreach_status === 'contacted' && !body.date_first_contacted) {
        body.date_first_contacted = new Date().toISOString();
      }
      if (['contacted', 'responded', 'demo_scheduled'].includes(body.outreach_status)) {
        body.date_last_contacted = new Date().toISOString();
      }
      if (body.outreach_status === 'demo_scheduled' && !body.date_demo_scheduled) {
        body.date_demo_scheduled = new Date().toISOString();
      }
      if (body.outreach_status === 'converted') {
        body.date_converted = new Date().toISOString();
      }
    }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .update(body)
    .eq('id', id)
    .eq('organization_id', org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(lead);
}

// DELETE /api/leads/[id] — Soft delete
export async function DELETE(
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

  const { error } = await supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
