'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Link2, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [org, setOrg] = useState<{ name: string; slug: string; plan: string; stripe_account_id: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brand').then(r => r.json()).then(d => {
      setOrg(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  const portalUrl = `${window.location.origin}/p/${org?.slug || 'your-org'}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and integrations</p>
      </div>

      {/* Organization */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings size={14} /> Organization
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Name</span>
            <span className="text-sm text-white font-medium">{org?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Slug</span>
            <span className="text-sm text-white font-mono">{org?.slug}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Plan</span>
            <Badge className="bg-amber-400/15 text-amber-400 border-amber-400/30 capitalize">{org?.plan}</Badge>
          </div>
        </div>
      </div>

      {/* Portal URL */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe size={14} /> Your Portal URL
        </h2>
        <div className="flex items-center gap-3">
          <Input value={portalUrl} readOnly className="bg-gray-800 border-gray-700 text-white font-mono text-sm" />
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(portalUrl)}
            className="border-gray-700 text-gray-400 cursor-pointer shrink-0"
          >
            Copy
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2">Share this URL with guests or use it in your PMS auto-messages.</p>
      </div>

      {/* Stripe Connect */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CreditCard size={14} /> Stripe Payments
        </h2>
        {org?.stripe_account_id ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400 font-medium">Connected</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Account: {org.stripe_account_id}</p>
            </div>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Active</Badge>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-3">Connect your Stripe account to receive payments from upsell purchases.</p>
            <Button className="bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
              <Link2 size={16} className="mr-2" /> Connect Stripe
            </Button>
            <p className="text-[10px] text-gray-600 mt-2">Takes about 5 minutes. Required before upsells go live.</p>
          </div>
        )}
      </div>

      {/* Integrations placeholder */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link2 size={14} /> PMS Integration
        </h2>
        <p className="text-sm text-gray-400 mb-3">Connect your property management system to auto-sync reservations.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-gray-400 cursor-pointer" disabled>
            Hostaway — Coming Soon
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-400 cursor-pointer" disabled>
            Guesty — Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
