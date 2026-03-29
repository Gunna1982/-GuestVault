import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface EnrichRequest {
  lead_ids?: string[];
  all?: boolean;
  filters?: Record<string, any>;
}

// POST /api/leads/enrich — Find leads needing enrichment and suggest search queries
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

  const body: EnrichRequest = await request.json();

  let query = supabase
    .from('leads')
    .select('*')
    .eq('organization_id', org.id)
    .is('deleted_at', null);

  // Filter to leads needing enrichment (missing email and/or website)
  query = query.or('email.is.null,website.is.null');

  // If specific lead_ids provided, filter to those
  if (body.lead_ids && body.lead_ids.length > 0) {
    query = query.in('id', body.lead_ids);
  }

  // Apply additional filters if provided
  if (body.filters) {
    const { tier, status, priority, source, market_area, county, min_units, max_units } = body.filters;
    if (tier && tier !== 'all') query = query.eq('tier', tier);
    if (status && status !== 'all') query = query.eq('outreach_status', status);
    if (priority && priority !== 'all') query = query.eq('outreach_priority', priority);
    if (source && source !== 'all') query = query.eq('source', source);
    if (market_area) query = query.ilike('market_area', `%${market_area}%`);
    if (county) query = query.contains('counties', [county]);
    if (min_units) query = query.gte('estimated_units', min_units);
    if (max_units) query = query.lte('estimated_units', max_units);
  }

  const { data: leadsNeedingEnrichment, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leadsNeedingEnrichment || leadsNeedingEnrichment.length === 0) {
    return NextResponse.json({
      message: 'No leads found needing enrichment',
      leads: [],
      count: 0,
    });
  }

  // Process each lead and generate enrichment suggestions
  const enrichmentCandidates = leadsNeedingEnrichment.map(lead => {
    const suggestions = [];
    const missingFields = [];

    // Check what's missing
    const missingEmail = !lead.email;
    const missingWebsite = !lead.website;

    if (missingEmail) missingFields.push('email');
    if (missingWebsite) missingFields.push('website');

    // Generate search query suggestions
    if (!lead.website) {
      const searchTerms = [];
      if (lead.company_name) searchTerms.push(lead.company_name);
      if (lead.market_area) searchTerms.push(lead.market_area);
      if (lead.brand_name) searchTerms.push(lead.brand_name);

      const query = searchTerms.filter(Boolean).join(' ');
      if (query) {
        suggestions.push({
          type: 'website_search',
          query: query,
          url: `https://www.google.com/search?q=${encodeURIComponent(query + ' website')}`,
        });
      }
    }

    if (!lead.email) {
      const searchTerms = [];
      if (lead.company_name) searchTerms.push(lead.company_name);
      if (lead.licensee_name) searchTerms.push(lead.licensee_name);

      const query = searchTerms.filter(Boolean).join(' ');
      if (query) {
        suggestions.push({
          type: 'email_search',
          query: query,
          url: `https://www.google.com/search?q=${encodeURIComponent(query + ' contact email')}`,
        });
      }
    }

    return {
      id: lead.id,
      company_name: lead.company_name,
      licensee_name: lead.licensee_name,
      brand_name: lead.brand_name,
      market_area: lead.market_area,
      email: lead.email,
      website: lead.website,
      missing_fields: missingFields,
      enrichment_suggestions: suggestions,
    };
  });

  // Log enrichment attempt activity for each lead
  const activityInserts = enrichmentCandidates.map(candidate => ({
    lead_id: candidate.id,
    organization_id: org.id,
    activity_type: 'enrichment_attempt',
    title: 'Enrichment suggested',
    description: `Missing fields: ${candidate.missing_fields.join(', ')}. ${candidate.enrichment_suggestions.length} suggestion(s) generated.`,
    metadata: {
      missing_fields: candidate.missing_fields,
      suggestion_count: candidate.enrichment_suggestions.length,
    },
  }));

  if (activityInserts.length > 0) {
    await supabase.from('lead_activities').insert(activityInserts);
  }

  return NextResponse.json({
    count: enrichmentCandidates.length,
    leads: enrichmentCandidates,
  });
}
