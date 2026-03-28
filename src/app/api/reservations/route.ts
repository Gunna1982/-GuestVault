import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

function generatePortalToken(): string {
  return randomBytes(32).toString('base64url');
}

// GET /api/reservations — list reservations for the authenticated user's org
export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();

  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 404 });

  const url = new URL(request.url);
  const propertyId = url.searchParams.get('property_id');
  const status = url.searchParams.get('status');

  let query = supabase
    .from('reservations')
    .select('*, properties(name, slug)')
    .eq('organization_id', org.id)
    .order('check_in', { ascending: false });

  if (propertyId) query = query.eq('property_id', propertyId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/reservations — create a manual reservation
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
  const { property_id, check_in, check_out, guest_count, channel, total_amount, guest_name, guest_email } = body;

  if (!property_id || !check_in || !check_out) {
    return NextResponse.json({ error: 'property_id, check_in, and check_out are required' }, { status: 400 });
  }

  const portalToken = generatePortalToken();

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      organization_id: org.id,
      property_id,
      check_in,
      check_out,
      guest_count: guest_count || 1,
      channel: channel || 'direct',
      total_amount: total_amount || null,
      portal_token: portalToken,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If guest info provided, create the primary guest record
  if (guest_name || guest_email) {
    const nameParts = (guest_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    await supabase.from('guests').insert({
      organization_id: org.id,
      reservation_id: reservation.id,
      first_name: firstName,
      last_name: lastName,
      email: guest_email || null,
      is_primary: true,
      source: 'manual',
    });
  }

  return NextResponse.json({
    ...reservation,
    portal_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://guest-vault.vercel.app'}/portal/${portalToken}`,
  }, { status: 201 });
}
