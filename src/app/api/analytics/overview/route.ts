import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/analytics/overview — dashboard metrics
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

  const orgId = org.id;

  // Parallel queries
  const [properties, reservations, guests, orders, emailSends] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('reservations').select('id, status, check_in, check_out, portal_accessed_at', { count: 'exact' }).eq('organization_id', orgId),
    supabase.from('guests').select('id, email, marketing_consent, source', { count: 'exact' }).eq('organization_id', orgId),
    supabase.from('upsell_orders').select('id, amount_cents, host_payout_cents, status').eq('organization_id', orgId),
    supabase.from('email_sends').select('id, status').eq('organization_id', orgId),
  ]);

  const allGuests = guests.data || [];
  const allReservations = reservations.data || [];
  const allOrders = orders.data || [];
  const allSends = emailSends.data || [];

  const guestsWithEmail = allGuests.filter(g => g.email);
  const guestsWithConsent = allGuests.filter(g => g.marketing_consent);
  const portalAccessed = allReservations.filter(r => r.portal_accessed_at);
  const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'fulfilled');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.host_payout_cents || 0), 0);

  const captureRate = allReservations.length > 0
    ? Math.round((guestsWithEmail.length / allReservations.length) * 100)
    : 0;

  const upsellConversion = portalAccessed.length > 0
    ? Math.round((paidOrders.length / portalAccessed.length) * 100)
    : 0;

  return NextResponse.json({
    properties: properties.count || 0,
    reservations: allReservations.length,
    guests: {
      total: allGuests.length,
      withEmail: guestsWithEmail.length,
      withConsent: guestsWithConsent.length,
      captureRate,
      bySource: {
        check_in_portal: allGuests.filter(g => g.source === 'check_in_portal').length,
        pms_sync: allGuests.filter(g => g.source === 'pms_sync').length,
        manual: allGuests.filter(g => g.source === 'manual').length,
      },
    },
    upsells: {
      totalOrders: paidOrders.length,
      totalRevenue,
      conversionRate: upsellConversion,
      avgOrderCents: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
    },
    emails: {
      total: allSends.length,
      sent: allSends.filter(s => s.status === 'sent' || s.status === 'delivered').length,
      opened: allSends.filter(s => s.status === 'opened' || s.status === 'clicked').length,
      clicked: allSends.filter(s => s.status === 'clicked').length,
    },
    portalAccessRate: allReservations.length > 0
      ? Math.round((portalAccessed.length / allReservations.length) * 100)
      : 0,
  });
}
