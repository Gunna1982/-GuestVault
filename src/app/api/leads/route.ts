import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/leads — List leads with filters, search, pagination
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const url = request.nextUrl;
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = (page - 1) * limit;
  const sort = url.searchParams.get('sort') || 'estimated_units';
  const order = url.searchParams.get('order') || 'desc';

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('organization_id', org.id)
    .is('deleted_at', null);

  // Filters
  const tier = url.searchParams.get('tier');
  if (tier && tier !== 'all') query = query.eq('tier', tier);

  const status = url.searchParams.get('outreach_status');
  if (status && status !== 'all') query = query.eq('outreach_status', status);

  const priority = url.searchParams.get('outreach_priority');
  if (priority && priority !== 'all') query = query.eq('outreach_priority', priority);

  const source = url.searchParams.get('source');
  if (source && source !== 'all') query = query.eq('source', source);

  const pms = url.searchParams.get('pms_used');
  if (pms) query = query.ilike('pms_used', `%${pms}%`);

  const market = url.searchParams.get('market_area');
  if (market) query = query.ilike('market_area', `%${market}%`);

  const county = url.searchParams.get('county');
  if (county) query = query.contains('counties', [county]);

  const hasEmail = url.searchParams.get('has_email');
  if (hasEmail === 'true') query = query.not('email', 'is', null);

  const hasWebsite = url.searchParams.get('has_website');
  if (hasWebsite === 'true') query = query.not('website', 'is', null);

  const minUnits = url.searchParams.get('min_units');
  if (minUnits) query = query.gte('estimated_units', parseInt(minUnits));

  const maxUnits = url.searchParams.get('max_units');
  if (maxUnits) query = query.lte('estimated_units', parseInt(maxUnits));

  const search = url.searchParams.get('search');
  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,brand_name.ilike.%${search}%,licensee_name.ilike.%${search}%,email.ilike.%${search}%,market_area.ilike.%${search}%`
    );
  }

  const tag = url.searchParams.get('tag');
  if (tag) query = query.contains('tags', [tag]);

  // Sort & Paginate
  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  const { data: leads, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    leads,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  });
}

// POST /api/leads — Create a lead
export async function POST(request: NextRequest) {
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
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({ ...body, organization_id: org.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabase.from('lead_activities').insert({
    lead_id: lead.id,
    organization_id: org.id,
    activity_type: 'import',
    title: 'Lead created',
    description: `Added ${lead.company_name} via ${body.source || 'manual'}`,
  });

  return NextResponse.json(lead, { status: 201 });
}
