import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/orders — list upsell orders for the org
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

  const { data: orders, error } = await supabase
    .from('upsell_orders')
    .select('*, upsell_templates(name, category), guests(first_name, last_name, email), reservations(check_in, check_out, properties(name))')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Calculate summary stats
  const paid = orders?.filter(o => o.status === 'paid' || o.status === 'fulfilled') || [];
  const totalRevenue = paid.reduce((sum, o) => sum + (o.host_payout_cents || 0), 0);
  const totalOrders = paid.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return NextResponse.json({
    orders: orders || [],
    stats: {
      totalRevenue,
      totalOrders,
      avgOrder,
      pendingCount: orders?.filter(o => o.status === 'pending').length || 0,
    },
  });
}
