import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/portal/:token/checkin — guest submits check-in form
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Validate token
  const { data: reservation } = await supabase
    .from('reservations')
    .select('id, organization_id, status')
    .eq('portal_token', token)
    .single();

  if (!reservation) {
    return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });
  }

  const body = await req.json();
  const { first_name, last_name, email, phone, marketing_consent } = body;

  if (!first_name || !email) {
    return NextResponse.json({ error: 'First name and email are required' }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  // Get client IP for consent tracking
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') || null;

  // Check if primary guest already exists
  const { data: existingGuest } = await supabase
    .from('guests')
    .select('id')
    .eq('reservation_id', reservation.id)
    .eq('is_primary', true)
    .single();

  if (existingGuest) {
    // Update existing primary guest
    await supabase
      .from('guests')
      .update({
        first_name,
        last_name: last_name || null,
        email,
        phone: phone || null,
        marketing_consent: marketing_consent || false,
        consent_timestamp: marketing_consent ? new Date().toISOString() : null,
        consent_ip: marketing_consent ? ip : null,
        source: 'check_in_portal',
      })
      .eq('id', existingGuest.id);
  } else {
    // Create new primary guest
    await supabase
      .from('guests')
      .insert({
        organization_id: reservation.organization_id,
        reservation_id: reservation.id,
        first_name,
        last_name: last_name || null,
        email,
        phone: phone || null,
        is_primary: true,
        marketing_consent: marketing_consent || false,
        consent_timestamp: marketing_consent ? new Date().toISOString() : null,
        consent_ip: marketing_consent ? ip : null,
        source: 'check_in_portal',
      });
  }

  // Update reservation status to checked_in
  if (reservation.status === 'confirmed') {
    await supabase
      .from('reservations')
      .update({ status: 'checked_in' })
      .eq('id', reservation.id);
  }

  return NextResponse.json({ success: true });
}
