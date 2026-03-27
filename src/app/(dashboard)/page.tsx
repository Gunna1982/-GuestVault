import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Building2, CalendarDays, Users, ShoppingBag } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_user_id', user!.id)
    .single();

  // Counts
  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org!.id);

  const { count: reservationCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org!.id);

  const { count: guestCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org!.id);

  const stats = [
    { label: 'Properties', value: propertyCount || 0, icon: Building2, href: '/properties', color: 'text-blue-400' },
    { label: 'Reservations', value: reservationCount || 0, icon: CalendarDays, href: '/reservations', color: 'text-green-400' },
    { label: 'Guests Captured', value: guestCount || 0, icon: Users, href: '/analytics', color: 'text-purple-400' },
    { label: 'Upsell Revenue', value: '$0', icon: ShoppingBag, href: '/orders', color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">{org!.name} &middot; {org!.plan} plan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Get Started</h2>
        <div className="space-y-3">
          <QuickAction
            step={1}
            title="Add your first property"
            description="Enter property details, WiFi info, and house rules"
            href="/properties"
            done={(propertyCount || 0) > 0}
          />
          <QuickAction
            step={2}
            title="Create a reservation"
            description="Add a booking manually or connect your PMS"
            href="/reservations"
            done={(reservationCount || 0) > 0}
          />
          <QuickAction
            step={3}
            title="Configure upsells"
            description="Set up late checkout, airport transfers, and more"
            href="/upsells"
            done={false}
          />
          <QuickAction
            step={4}
            title="Connect Stripe"
            description="Start accepting payments for upsells"
            href="/settings"
            done={!!org!.stripe_account_id}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ step, title, description, href, done }: {
  step: number; title: string; description: string; href: string; done: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
        done ? 'bg-green-500/5 border border-green-500/20' : 'bg-gray-800/30 border border-gray-800 hover:border-gray-700'
      }`}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        done ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'
      }`}>
        {done ? '✓' : step}
      </span>
      <div>
        <p className={`text-sm font-medium ${done ? 'text-green-400' : 'text-white'}`}>{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
