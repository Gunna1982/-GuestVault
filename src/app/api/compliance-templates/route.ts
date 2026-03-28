import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/compliance-templates — list compliance message templates
// Returns system templates + org-specific templates
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

  // Get system templates + org-specific templates
  const { data: templates } = await supabase
    .from('compliance_templates')
    .select('*')
    .or(`is_system.eq.true,organization_id.eq.${org.id}`)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return NextResponse.json({ templates: templates || [] });
}

// POST /api/compliance-templates — create a custom template
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
  const { name, category, message_text, platform } = body;

  if (!name || !message_text) {
    return NextResponse.json({ error: 'Name and message text are required' }, { status: 400 });
  }

  const { data: template, error } = await supabase
    .from('compliance_templates')
    .insert({
      organization_id: org.id,
      name,
      category: category || 'custom',
      message_text,
      platform: platform || 'all',
      is_system: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(template, { status: 201 });
}
