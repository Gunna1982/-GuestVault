'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Organization } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import {
  Home, Building2, CalendarDays, ShoppingBag, Package,
  Mail, BarChart3, Users, Palette, Settings, LogOut, Menu, X, Target, Send
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Properties', href: '/properties', icon: Building2 },
  { label: 'Reservations', href: '/reservations', icon: CalendarDays },
  { label: 'Upsells', href: '/upsells', icon: ShoppingBag },
  { label: 'Orders', href: '/orders', icon: Package },
  { label: 'Marketing', href: '/marketing', icon: Mail },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Lead Pipeline', href: '/leads', icon: Target },
  { label: 'Outreach', href: '/leads/outreach', icon: Send },
  { label: 'Providers', href: '/providers', icon: Users },
  { label: 'Branding', href: '/brand', icon: Palette },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardShell({
  org,
  user,
  children,
}: {
  org: Organization;
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="text-lg font-bold tracking-wide text-amber-400">
            StaySteward
          </Link>
          <p className="text-xs text-gray-500 mt-1 truncate">{org.name}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 truncate">{user.email}</p>
              <p className="text-xs text-gray-600 capitalize">{org.plan} plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors w-full cursor-pointer"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 cursor-pointer">
            <Menu size={24} />
          </button>
          <span className="text-amber-400 font-bold">StaySteward</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
