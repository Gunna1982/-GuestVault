import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

// GET /api/properties — list all properties for the authenticated user's org
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

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(properties);
}

// POST /api/properties — create a new property
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
  const { name, description, address, property_info, images } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Property name is required' }, { status: 400 });
  }

  const slug = slugify(name);

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      organization_id: org.id,
      name,
      slug,
      description: description || null,
      address: address || null,
      property_info: property_info || {},
      images: images || [],
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return NextResponse.json({ error: 'A property with that name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(property, { status: 201 });
}
