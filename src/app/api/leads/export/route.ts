import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Helper function to escape CSV values
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// Helper function to convert array to CSV-friendly string
function arrayToCSV(arr: any[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map(item => escapeCSV(item)).join(';');
}

// GET /api/leads/export — Export leads as CSV
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

  try {
    const url = request.nextUrl;

    // Build the same query as the main leads GET endpoint for consistency
    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', org.id)
      .is('deleted_at', null);

    // Apply filters from query parameters
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

    // Apply sort if provided
    const sort = url.searchParams.get('sort') || 'estimated_units';
    const order = url.searchParams.get('order') || 'desc';
    query = query.order(sort, { ascending: order === 'asc' });

    // Fetch all matching leads (no pagination for export)
    const { data: leads, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      // Return empty CSV with headers
      const headers = [
        'ID',
        'Company Name',
        'Brand Name',
        'Licensee Name',
        'Market Area',
        'Email',
        'Phone',
        'Website',
        'Tier',
        'Estimated Units',
        'PMS Used',
        'Outreach Status',
        'Outreach Priority',
        'Source',
        'Counties',
        'Tags',
        'Date First Contacted',
        'Date Last Contacted',
        'Date Demo Scheduled',
        'Date Converted',
      ];
      const csv = headers.map(escapeCSV).join(',') + '\n';
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Build CSV
    const headers = [
      'ID',
      'Company Name',
      'Brand Name',
      'Licensee Name',
      'Market Area',
      'Email',
      'Phone',
      'Website',
      'Tier',
      'Estimated Units',
      'PMS Used',
      'Outreach Status',
      'Outreach Priority',
      'Source',
      'Counties',
      'Tags',
      'Date First Contacted',
      'Date Last Contacted',
      'Date Demo Scheduled',
      'Date Converted',
    ];

    const rows = leads.map(lead => [
      escapeCSV(lead.id),
      escapeCSV(lead.company_name),
      escapeCSV(lead.brand_name),
      escapeCSV(lead.licensee_name),
      escapeCSV(lead.market_area),
      escapeCSV(lead.email),
      escapeCSV(lead.phone),
      escapeCSV(lead.website),
      escapeCSV(lead.tier),
      escapeCSV(lead.estimated_units),
      escapeCSV(lead.pms_used),
      escapeCSV(lead.outreach_status),
      escapeCSV(lead.outreach_priority),
      escapeCSV(lead.source),
      arrayToCSV(lead.counties),
      arrayToCSV(lead.tags),
      escapeCSV(lead.date_first_contacted),
      escapeCSV(lead.date_last_contacted),
      escapeCSV(lead.date_demo_scheduled),
      escapeCSV(lead.date_converted),
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
