import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/leads/stats — Return aggregated pipeline statistics
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
    // Get all non-deleted leads for this organization
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, tier, outreach_status, outreach_priority, source, email, website, phone, estimated_units')
      .eq('organization_id', org.id)
      .is('deleted_at', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        total: 0,
        by_tier: {},
        by_status: {},
        by_priority: {},
        by_source: {},
        with_email: 0,
        with_website: 0,
        with_phone: 0,
        avg_units: 0,
      });
    }

    const stats = {
      total: leads.length,
      by_tier: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
      by_priority: {} as Record<string, number>,
      by_source: {} as Record<string, number>,
      with_email: 0,
      with_website: 0,
      with_phone: 0,
      avg_units: 0,
      total_units: 0,
    };

    // Aggregate statistics
    for (const lead of leads) {
      // Count by tier
      if (lead.tier) {
        stats.by_tier[lead.tier] = (stats.by_tier[lead.tier] || 0) + 1;
      }

      // Count by status
      if (lead.outreach_status) {
        stats.by_status[lead.outreach_status] = (stats.by_status[lead.outreach_status] || 0) + 1;
      }

      // Count by priority
      if (lead.outreach_priority) {
        stats.by_priority[lead.outreach_priority] = (stats.by_priority[lead.outreach_priority] || 0) + 1;
      }

      // Count by source
      if (lead.source) {
        stats.by_source[lead.source] = (stats.by_source[lead.source] || 0) + 1;
      }

      // Count contact fields
      if (lead.email) stats.with_email++;
      if (lead.website) stats.with_website++;
      if (lead.phone) stats.with_phone++;

      // Sum units for average
      if (lead.estimated_units) {
        stats.total_units += lead.estimated_units;
      }
    }

    // Calculate average units
    stats.avg_units = stats.total_units > 0 ? Math.round(stats.total_units / stats.total) : 0;

    // Remove total_units from response
    const { total_units, ...finalStats } = stats;

    return NextResponse.json(finalStats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
