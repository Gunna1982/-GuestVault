import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// POST /api/portal/:token/checkin — guest submits check-in form (Step 1)
// Compliance-First: This is framed as "Guest Verification" — the data capture
// event positioned as a regulatory requirement, not a marketing ask.
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
  const { first_name, last_name, email, phone, emergency_phone, id_document_type, marketing_consent } = body;

  if (!first_name || !email) {
    return NextResponse.json({ error: 'First name and email are required' }, { status: 400 });
  }

  // Last name required for compliance (identity verification)
  if (!last_name) {
    return NextResponse.json({ error: 'Last name is required for guest verification' }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  // Get client IP for consent tracking (audit trail)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') || null;

  // Generate unsubscribe token for email compliance (CAN-SPAM/GDPR)
  const unsubscribeToken = crypto.randomBytes(32).toString('hex');

  // Check if primary guest already exists
  const { data: existingGuest } = await supabase
    .from('guests')
    .select('id')
    .eq('reservation_id', reservation.id)
    .eq('is_primary', true)
    .single();

  const guestData = {
    first_name,
    last_name,
    email,
    phone: phone || null,
    emergency_phone: emergency_phone || null,
    id_document_type: id_document_type || null,
    id_verified: !!id_document_type,
    id_verified_at: id_document_type ? new Date().toISOString() : null,
    // COMPLIANCE: Only record consent data when consent is explicitly TRUE
    // GDPR requires affirmative action — checkbox defaults to false
    marketing_consent: marketing_consent || false,
    consent_timestamp: marketing_consent ? new Date().toISOString() : null,
    consent_ip: marketing_consent ? ip : null,
    source: 'check_in_portal' as const,
    unsubscribe_token: unsubscribeToken,
    checkin_completed_at: new Date().toISOString(),
  };

  if (existingGuest) {
    await supabase
      .from('guests')
      .update(guestData)
      .eq('id', existingGuest.id);
  } else {
    await supabase
      .from('guests')
      .insert({
        organization_id: reservation.organization_id,
        reservation_id: reservation.id,
        is_primary: true,
        ...guestData,
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

// PATCH /api/portal/:token/checkin — accept rental agreement (Step 2)
export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select('id, organization_id')
    .eq('portal_token', token)
    .single();

  if (!reservation) {
    return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });
  }

  const body = await req.json();
  const { accept_rental_agreement, rental_agreement_id } = body;

  if (accept_rental_agreement && rental_agreement_id) {
    // Get the primary guest
    const { data: guest } = await supabase
      .from('guests')
      .select('id')
      .eq('reservation_id', reservation.id)
      .eq('is_primary', true)
      .single();

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found — please complete check-in first' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    // Record agreement acceptance (audit trail)
    await supabase
      .from('agreement_acceptances')
      .upsert({
        guest_id: guest.id,
        rental_agreement_id,
        accepted_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
      }, { onConflict: 'guest_id,rental_agreement_id' });

    // Update guest record
    await supabase
      .from('guests')
      .update({
        rental_agreement_accepted: true,
        rental_agreement_accepted_at: new Date().toISOString(),
        rental_agreement_ip: ip,
      })
      .eq('id', guest.id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
