import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';

// POST /api/portal/:token/orders — guest creates an upsell order
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Validate token + get reservation
  const { data: reservation } = await supabase
    .from('reservations')
    .select('id, organization_id, property_id')
    .eq('portal_token', token)
    .single();

  if (!reservation) {
    return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });
  }

  // Get the primary guest
  const { data: guest } = await supabase
    .from('guests')
    .select('id, email, first_name')
    .eq('reservation_id', reservation.id)
    .eq('is_primary', true)
    .single();

  if (!guest?.email) {
    return NextResponse.json({ error: 'Please check in first' }, { status: 400 });
  }

  const body = await req.json();
  const { upsell_id, quantity = 1 } = body;

  if (!upsell_id) {
    return NextResponse.json({ error: 'Upsell ID required' }, { status: 400 });
  }

  // Get the upsell template
  const { data: upsell } = await supabase
    .from('upsell_templates')
    .select('*')
    .eq('id', upsell_id)
    .eq('organization_id', reservation.organization_id)
    .eq('is_active', true)
    .single();

  if (!upsell) {
    return NextResponse.json({ error: 'Upsell not found or not available' }, { status: 404 });
  }

  // Calculate amounts
  const amountCents = upsell.price_cents * quantity;
  const platformFeePct = 5; // 5% platform fee (adjustable by plan)
  const platformFeeCents = Math.round(amountCents * platformFeePct / 100);
  const hostPayoutCents = amountCents - platformFeeCents;

  // Get org for Stripe account
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_account_id, name')
    .eq('id', reservation.organization_id)
    .single();

  try {
    // Create Stripe Payment Intent
    const paymentIntentData: Record<string, unknown> = {
      amount: amountCents,
      currency: upsell.currency || 'usd',
      metadata: {
        organization_id: reservation.organization_id,
        reservation_id: reservation.id,
        guest_id: guest.id,
        upsell_template_id: upsell.id,
        upsell_name: upsell.name,
        quantity: String(quantity),
      },
      receipt_email: guest.email,
      description: `${upsell.name}${quantity > 1 ? ` x${quantity}` : ''} — ${org?.name || 'StaySteward'}`,
    };

    // If host has Stripe Connect, set up automatic transfer
    if (org?.stripe_account_id) {
      paymentIntentData.transfer_data = {
        destination: org.stripe_account_id,
        amount: hostPayoutCents,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData as unknown as Parameters<typeof stripe.paymentIntents.create>[0]);

    // Create order record
    const { data: order, error: orderErr } = await supabase
      .from('upsell_orders')
      .insert({
        organization_id: reservation.organization_id,
        reservation_id: reservation.id,
        guest_id: guest.id,
        upsell_template_id: upsell.id,
        quantity,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        host_payout_cents: hostPayoutCents,
        stripe_payment_id: paymentIntent.id,
        status: 'pending',
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Orders] DB insert failed:', orderErr);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order?.id,
      amount: amountCents,
      currency: upsell.currency || 'usd',
    });
  } catch (err) {
    console.error('[Orders] Stripe error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment failed' },
      { status: 500 }
    );
  }
}
