import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { LeadImportRow } from '@/types/leads';

// POST /api/leads/import — Bulk import leads from JSON array
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
  const { leads: importRows, deduplicate = true } = body as {
    leads: LeadImportRow[];
    deduplicate?: boolean;
  };

  if (!Array.isArray(importRows) || importRows.length === 0) {
    return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
  }

  // Get existing leads for dedup
  const existingNames = new Set<string>();
  if (deduplicate) {
    const { data: existing } = await supabase
      .from('leads')
      .select('company_name, licensee_name')
      .eq('organization_id', org.id)
      .is('deleted_at', null);

    if (existing) {
      existing.forEach((l) => {
        if (l.company_name) existingNames.add(l.company_name.toLowerCase().trim());
        if (l.licensee_name) existingNames.add(l.licensee_name.toLowerCase().trim());
      });
    }
  }

  const toInsert = [];
  const skipped = [];

  for (const row of importRows) {
    const name = (row.company_name || '').toLowerCase().trim();
    const licName = (row.licensee_name || '').toLowerCase().trim();

    if (deduplicate && (existingNames.has(name) || (licName && existingNames.has(licName)))) {
      skipped.push(row.company_name);
      continue;
    }

    existingNames.add(name);
    if (licName) existingNames.add(licName);

    toInsert.push({
      organization_id: org.id,
      company_name: row.company_name,
      brand_name: row.brand_name || null,
      licensee_name: row.licensee_name || null,
      email: row.email || null,
      phone: row.phone || null,
      website: row.website || null,
      contact_person: row.contact_person || null,
      tier: row.tier || 'unknown',
      estimated_units: row.estimated_units || 0,
      license_count: row.license_count || 0,
      license_type: row.license_type || 'unknown',
      market_area: row.market_area || null,
      counties: row.counties ? row.counties.split(',').map((c: string) => c.trim()) : [],
      cities: row.cities ? row.cities.split(',').map((c: string) => c.trim()) : [],
      state: 'FL',
      pms_used: row.pms_used || null,
      current_upsells: row.current_upsells || null,
      tech_sophistication: row.tech_sophistication || 'unknown',
      guestvault_opportunity: row.guestvault_opportunity || null,
      services_offered: row.services_offered || null,
      source: row.source || 'manual',
      source_detail: row.source_detail || null,
      enrichment_notes: row.enrichment_notes || null,
      outreach_status: 'not_contacted',
      outreach_priority: row.outreach_priority || 'none',
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
    });
  }

  // Batch insert in chunks of 100
  const results = { inserted: 0, skipped: skipped.length, errors: 0 };
  const chunkSize = 100;

  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('leads').insert(chunk);

    if (error) {
      console.error('Batch insert error:', error);
      results.errors += chunk.length;
    } else {
      results.inserted += chunk.length;
    }
  }

  // Log import activity
  await supabase.from('lead_activities').insert({
    lead_id: null,
    organization_id: org.id,
    activity_type: 'import',
    title: `Bulk import: ${results.inserted} leads`,
    description: `Imported ${results.inserted}, skipped ${results.skipped} duplicates, ${results.errors} errors`,
    metadata: { total_rows: importRows.length, ...results },
  });

  return NextResponse.json({
    message: `Import complete`,
    ...results,
    total_submitted: importRows.length,
  });
}
