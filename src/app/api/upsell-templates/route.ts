import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Pre-built upsell templates that hosts can enable
const STARTER_TEMPLATES = [
  { category: 'checkout', name: 'Late Checkout', description: 'Extend your stay until 2 PM instead of the standard checkout time. Perfect for late flights or a relaxed last morning.', price_cents: 3500, price_type: 'fixed' },
  { category: 'checkout', name: 'Early Check-In', description: 'Arrive early and get settled in. Access your property from 1 PM instead of the standard check-in time.', price_cents: 2500, price_type: 'fixed' },
  { category: 'transport', name: 'Airport Transfer', description: 'Private car service from the airport directly to your property. Driver meets you at arrivals with a name sign.', price_cents: 6500, price_type: 'fixed' },
  { category: 'grocery', name: 'Grocery Pre-Stock', description: 'Arrive to a fully stocked kitchen. Share your preferences and we\'ll have everything ready before you check in.', price_cents: 4500, price_type: 'fixed' },
  { category: 'cleaning', name: 'Mid-Stay Cleaning', description: 'Full cleaning service during your stay — fresh linens, towels, vacuuming, bathroom sanitization, and kitchen cleanup.', price_cents: 7500, price_type: 'fixed' },
  { category: 'experience', name: 'Local Experience Package', description: 'Curated recommendations and reservations at the best local restaurants, activities, and hidden gems — personalized to your interests.', price_cents: 2500, price_type: 'per_person' },
  { category: 'equipment', name: 'Beach Equipment Rental', description: 'Chairs, umbrella, cooler, and towels delivered to the nearest beach. Everything you need for a perfect beach day.', price_cents: 3500, price_type: 'fixed' },
  { category: 'chef', name: 'Private Chef Dinner', description: 'Professional chef prepares a multi-course dinner in your property kitchen. Menu customized to your preferences and dietary needs.', price_cents: 15000, price_type: 'per_person' },
];

// GET /api/upsell-templates — list all upsell templates for the org
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

  const { data, error } = await supabase
    .from('upsell_templates')
    .select('*')
    .eq('organization_id', org.id)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data, starters: STARTER_TEMPLATES });
}

// POST /api/upsell-templates — create a new upsell template
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
  const { category, name, description, image_url, price_cents, price_type, requires_lead_time } = body;

  if (!name || !price_cents) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('upsell_templates')
    .insert({
      organization_id: org.id,
      category: category || 'custom',
      name,
      description: description || null,
      image_url: image_url || null,
      price_cents: Math.round(price_cents),
      price_type: price_type || 'fixed',
      requires_lead_time: requires_lead_time || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/upsell-templates — update an existing template
export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Template ID required' }, { status: 400 });

  const allowed = ['name', 'description', 'image_url', 'price_cents', 'price_type', 'category', 'requires_lead_time', 'is_active', 'display_order'];
  const clean: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) clean[key] = updates[key];
  }

  const { data, error } = await supabase
    .from('upsell_templates')
    .update(clean)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
