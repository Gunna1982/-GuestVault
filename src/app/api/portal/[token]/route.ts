import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/portal/:token — load portal data for a guest (no auth required)
// Returns compliance config, rental agreement state, and property info
// based on the guest's current step in the compliance flow.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Find reservation by portal token, include org compliance config
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*, properties(*), organizations(name, slug, brand_config, compliance_config)')
    .eq('portal_token', token)
    .single();

  if (error || !reservation) {
    return NextResponse.json({ error: 'Invalid or expired portal link' }, { status: 404 });
  }

  // Mark portal as accessed
  if (!reservation.portal_accessed_at) {
    await supabase
      .from('reservations')
      .update({ portal_accessed_at: new Date().toISOString() })
      .eq('id', reservation.id);
  }

  // Get existing guests for this reservation
  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, email, is_primary, rental_agreement_accepted')
    .eq('reservation_id', reservation.id);

  // Check if primary guest has checked in (has email)
  const primaryGuest = guests?.find(g => g.is_primary);
  const isCheckedIn = !!(primaryGuest?.email);

  // Check if rental agreement exists for this property/org
  let rentalAgreement = null;
  let agreementAccepted = false;

  // First check for property-specific agreement, then org-wide
  const { data: agreements } = await supabase
    .from('rental_agreements')
    .select('id, title, body_text')
    .eq('organization_id', reservation.organization_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (agreements && agreements.length > 0) {
    // Prefer property-specific, fall back to org-wide
    const propertyAgreement = await supabase
      .from('rental_agreements')
      .select('id, title, body_text')
      .eq('organization_id', reservation.organization_id)
      .eq('property_id', reservation.property_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    rentalAgreement = propertyAgreement.data || agreements[0];

    // Check if this guest already accepted
    if (primaryGuest && rentalAgreement) {
      const { data: acceptance } = await supabase
        .from('agreement_acceptances')
        .select('id')
        .eq('guest_id', primaryGuest.id)
        .eq('rental_agreement_id', rentalAgreement.id)
        .single();

      agreementAccepted = !!acceptance;
    }
  }

  // Get available upsells for this property (only after check-in)
  let upsells: unknown[] = [];
  if (isCheckedIn && reservation.properties?.id) {
    const { data: propertyUpsells } = await supabase
      .from('upsell_templates')
      .select('*')
      .eq('organization_id', reservation.organization_id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true });

    upsells = (propertyUpsells || []).map(u => ({
      id: u.id,
      category: u.category,
      name: u.name,
      description: u.description,
      price_cents: u.price_cents,
      price_type: u.price_type,
      image_url: u.image_url,
    }));
  }

  return NextResponse.json({
    reservation: {
      id: reservation.id,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      guest_count: reservation.guest_count,
      status: reservation.status,
    },
    property: reservation.properties ? {
      name: reservation.properties.name,
      description: reservation.properties.description,
      // Only reveal sensitive info after check-in (WiFi is the reward)
      property_info: isCheckedIn ? reservation.properties.property_info : {
        checkout_time: reservation.properties.property_info?.checkout_time,
      },
      images: reservation.properties.images,
    } : null,
    organization: reservation.organizations ? {
      name: reservation.organizations.name,
      brand_config: reservation.organizations.brand_config,
      compliance_config: reservation.organizations.compliance_config || {
        require_id_verification: false,
        require_rental_agreement: true,
        require_emergency_contact: false,
        gdpr_mode: false,
        physical_mailing_address: '',
      },
    } : null,
    guests: guests || [],
    isCheckedIn,
    rentalAgreement,
    agreementAccepted,
    upsells,
  });
}
