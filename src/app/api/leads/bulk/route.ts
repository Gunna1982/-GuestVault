import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface BulkOperation {
  action: 'update_status' | 'update_priority' | 'add_tag' | 'remove_tag' | 'delete';
  lead_ids: string[];
  value?: string;
}

// POST /api/leads/bulk — Perform bulk operations on multiple leads
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

  const body: BulkOperation = await request.json();

  if (!body.action || !body.lead_ids || body.lead_ids.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields: action, lead_ids' },
      { status: 400 }
    );
  }

  // Validate that all leads belong to this organization
  const { data: leads, error: fetchError } = await supabase
    .from('leads')
    .select('id, company_name, outreach_status, outreach_priority, tags')
    .eq('organization_id', org.id)
    .in('id', body.lead_ids)
    .is('deleted_at', null);

  if (fetchError || !leads || leads.length === 0) {
    return NextResponse.json(
      { error: 'No valid leads found for the provided IDs' },
      { status: 404 }
    );
  }

  const results = {
    action: body.action,
    processed: 0,
    failed: 0,
    activities_logged: 0,
  };

  const activityInserts: any[] = [];

  try {
    switch (body.action) {
      case 'update_status': {
        if (!body.value) {
          return NextResponse.json(
            { error: 'update_status requires value parameter' },
            { status: 400 }
          );
        }

        const { error: updateError } = await supabase
          .from('leads')
          .update({
            outreach_status: body.value,
            date_last_contacted: new Date().toISOString(),
            ...(body.value === 'converted' && { date_converted: new Date().toISOString() }),
            ...(body.value === 'demo_scheduled' && { date_demo_scheduled: new Date().toISOString() }),
          })
          .eq('organization_id', org.id)
          .in('id', body.lead_ids);

        if (updateError) throw updateError;

        for (const lead of leads) {
          activityInserts.push({
            lead_id: lead.id,
            organization_id: org.id,
            activity_type: 'status_change',
            title: `Status: ${lead.outreach_status} → ${body.value}`,
            description: `${lead.company_name} bulk status update to ${body.value}`,
            metadata: { from: lead.outreach_status, to: body.value },
          });
        }

        results.processed = leads.length;
        break;
      }

      case 'update_priority': {
        if (!body.value) {
          return NextResponse.json(
            { error: 'update_priority requires value parameter' },
            { status: 400 }
          );
        }

        const { error: updateError } = await supabase
          .from('leads')
          .update({ outreach_priority: body.value })
          .eq('organization_id', org.id)
          .in('id', body.lead_ids);

        if (updateError) throw updateError;

        for (const lead of leads) {
          activityInserts.push({
            lead_id: lead.id,
            organization_id: org.id,
            activity_type: 'priority_change',
            title: `Priority: ${lead.outreach_priority} → ${body.value}`,
            description: `${lead.company_name} priority bulk update to ${body.value}`,
            metadata: { from: lead.outreach_priority, to: body.value },
          });
        }

        results.processed = leads.length;
        break;
      }

      case 'add_tag': {
        if (!body.value) {
          return NextResponse.json(
            { error: 'add_tag requires value parameter' },
            { status: 400 }
          );
        }

        for (const lead of leads) {
          const currentTags = Array.isArray(lead.tags) ? lead.tags : [];
          if (!currentTags.includes(body.value)) {
            currentTags.push(body.value);

            const { error: updateError } = await supabase
              .from('leads')
              .update({ tags: currentTags })
              .eq('id', lead.id);

            if (!updateError) {
              results.processed++;
              activityInserts.push({
                lead_id: lead.id,
                organization_id: org.id,
                activity_type: 'tag_added',
                title: `Tag added: ${body.value}`,
                description: `Added tag "${body.value}" to ${lead.company_name}`,
                metadata: { tag: body.value },
              });
            } else {
              results.failed++;
            }
          } else {
            results.processed++;
          }
        }
        break;
      }

      case 'remove_tag': {
        if (!body.value) {
          return NextResponse.json(
            { error: 'remove_tag requires value parameter' },
            { status: 400 }
          );
        }

        for (const lead of leads) {
          const currentTags = Array.isArray(lead.tags) ? lead.tags : [];
          const filteredTags = currentTags.filter(tag => tag !== body.value);

          if (filteredTags.length < currentTags.length) {
            const { error: updateError } = await supabase
              .from('leads')
              .update({ tags: filteredTags })
              .eq('id', lead.id);

            if (!updateError) {
              results.processed++;
              activityInserts.push({
                lead_id: lead.id,
                organization_id: org.id,
                activity_type: 'tag_removed',
                title: `Tag removed: ${body.value}`,
                description: `Removed tag "${body.value}" from ${lead.company_name}`,
                metadata: { tag: body.value },
              });
            } else {
              results.failed++;
            }
          } else {
            results.processed++;
          }
        }
        break;
      }

      case 'delete': {
        const { error: deleteError } = await supabase
          .from('leads')
          .update({ deleted_at: new Date().toISOString() })
          .eq('organization_id', org.id)
          .in('id', body.lead_ids);

        if (deleteError) throw deleteError;

        for (const lead of leads) {
          activityInserts.push({
            lead_id: lead.id,
            organization_id: org.id,
            activity_type: 'delete',
            title: 'Lead deleted',
            description: `${lead.company_name} was deleted via bulk operation`,
          });
        }

        results.processed = leads.length;
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Unknown action: ${body.action}` },
          { status: 400 }
        );
      }
    }

    // Log all activities
    if (activityInserts.length > 0) {
      const { error: activityError } = await supabase
        .from('lead_activities')
        .insert(activityInserts);

      if (!activityError) {
        results.activities_logged = activityInserts.length;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
