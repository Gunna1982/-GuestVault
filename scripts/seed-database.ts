/**
 * StaySteward Lead Seeder
 *
 * Usage:
 *   npx tsx scripts/seed-database.ts
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * This script:
 * 1. Reads seed-leads.json (704 leads)
 * 2. Gets or creates the organization
 * 3. Deduplicates against existing leads
 * 4. Batch inserts in chunks of 100
 * 5. Logs import activity
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Set them in .env.local or as environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('StaySteward Lead Seeder');
  console.log('======================\n');

  // 1. Load seed data
  const seedPath = join(__dirname, 'seed-leads.json');
  const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));
  console.log(`Loaded ${seedData.length} leads from seed file`);

  // 2. Get organization (use the first one, or pass ORG_ID env var)
  const orgId = process.env.ORG_ID;
  let organizationId: string;

  if (orgId) {
    organizationId = orgId;
    console.log(`Using org ID from env: ${organizationId}`);
  } else {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
      .single();

    if (error || !orgs) {
      console.error('No organization found. Create one first via the app, or set ORG_ID env var.');
      process.exit(1);
    }
    organizationId = orgs.id;
    console.log(`Using org: ${orgs.name} (${organizationId})`);
  }

  // 3. Get existing leads for dedup
  const { data: existing } = await supabase
    .from('leads')
    .select('company_name, licensee_name')
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  const existingNames = new Set<string>();
  (existing || []).forEach((l: any) => {
    if (l.company_name) existingNames.add(l.company_name.toLowerCase().trim());
    if (l.licensee_name) existingNames.add(l.licensee_name.toLowerCase().trim());
  });

  console.log(`Existing leads in DB: ${existingNames.size}`);

  // 4. Prepare inserts
  const toInsert: any[] = [];
  let skipped = 0;

  for (const row of seedData) {
    const name = (row.company_name || '').toLowerCase().trim();
    const licName = (row.licensee_name || '').toLowerCase().trim();

    if (existingNames.has(name) || (licName && existingNames.has(licName))) {
      skipped++;
      continue;
    }

    existingNames.add(name);
    if (licName) existingNames.add(licName);

    toInsert.push({
      organization_id: organizationId,
      company_name: row.company_name || 'Unknown',
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
      counties: Array.isArray(row.counties) ? row.counties :
        (row.counties ? row.counties.split(',').map((c: string) => c.trim()) : []),
      cities: Array.isArray(row.cities) ? row.cities :
        (row.cities ? row.cities.split(',').map((c: string) => c.trim()) : []),
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
      tags: Array.isArray(row.tags) ? row.tags :
        (row.tags ? row.tags.split(',').map((t: string) => t.trim()) : []),
    });
  }

  console.log(`\nTo insert: ${toInsert.length}`);
  console.log(`Skipped (duplicates): ${skipped}`);

  // 5. Batch insert
  const chunkSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('leads').insert(chunk);

    if (error) {
      console.error(`Batch ${Math.floor(i / chunkSize) + 1} error:`, error.message);
      errors += chunk.length;
    } else {
      inserted += chunk.length;
      process.stdout.write(`\rInserted: ${inserted}/${toInsert.length}`);
    }
  }

  console.log('\n');

  // 6. Log activity
  await supabase.from('lead_activities').insert({
    lead_id: null,
    organization_id: organizationId,
    activity_type: 'import',
    title: `Seed import: ${inserted} Florida leads`,
    description: `Seeded ${inserted} leads from DBPR + web research. Skipped ${skipped} duplicates. ${errors} errors.`,
    metadata: { inserted, skipped, errors, total: seedData.length },
  });

  // 7. Summary
  console.log('=== SEED COMPLETE ===');
  console.log(`Inserted:  ${inserted}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Errors:    ${errors}`);
  console.log(`Total:     ${seedData.length}`);

  // Stats
  const { data: stats } = await supabase
    .from('leads')
    .select('tier')
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  if (stats) {
    const tiers: Record<string, number> = {};
    stats.forEach((l: any) => { tiers[l.tier] = (tiers[l.tier] || 0) + 1; });
    console.log('\nLead Tiers:');
    Object.entries(tiers).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
      console.log(`  ${tier}: ${count}`);
    });
  }
}

main().catch(console.error);
