import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/brand — get org brand config
export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('brand_config, name, slug')
    .eq('owner_user_id', user.id)
    .single();

  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });
  return NextResponse.json(org);
}

// POST /api/brand — update org brand config
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const brandConfig = await request.json();

  const { data, error } = await supabase
    .from('organizations')
    .update({ brand_config: brandConfig })
    .eq('owner_user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, brand_config: data.brand_config });
}
