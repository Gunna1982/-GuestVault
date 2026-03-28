'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Mail, BarChart3, Building2, CalendarDays, ShoppingBag, MousePointer } from 'lucide-react';

interface AnalyticsData {
  properties: number;
  reservations: number;
  guests: { total: number; withEmail: number; withConsent: number; captureRate: number; bySource: Record<string, number> };
  upsells: { totalOrders: number; totalRevenue: number; conversionRate: number; avgOrderCents: number };
  emails: { total: number; sent: number; opened: number; clicked: number };
  portalAccessRate: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/overview').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading analytics...</div>;
  if (!data) return <div className="text-gray-500 text-center py-20">Failed to load analytics</div>;

  const openRate = data.emails.sent > 0 ? Math.round((data.emails.opened / data.emails.sent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Your guest capture and revenue metrics</p>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Users} label="Emails Captured" value={String(data.guests.withEmail)} subtext={`${data.guests.captureRate}% capture rate`} color="text-blue-400" />
        <KPI icon={DollarSign} label="Upsell Revenue" value={formatCents(data.upsells.totalRevenue)} subtext={`${data.upsells.totalOrders} orders`} color="text-green-400" />
        <KPI icon={Mail} label="Email Open Rate" value={`${openRate}%`} subtext={`${data.emails.sent} sent`} color="text-amber-400" />
        <KPI icon={MousePointer} label="Portal Access" value={`${data.portalAccessRate}%`} subtext={`of ${data.reservations} reservations`} color="text-purple-400" />
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Capture */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-400" /> Guest Capture
          </h2>
          <div className="space-y-3">
            <MetricRow label="Total Guests" value={String(data.guests.total)} />
            <MetricRow label="With Email" value={String(data.guests.withEmail)} highlight />
            <MetricRow label="Marketing Consent" value={String(data.guests.withConsent)} />
            <MetricRow label="Capture Rate" value={`${data.guests.captureRate}%`} highlight />
            <div className="border-t border-gray-800 pt-3 mt-3">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">By Source</p>
              <MetricRow label="Check-in Portal" value={String(data.guests.bySource.check_in_portal || 0)} />
              <MetricRow label="PMS Sync" value={String(data.guests.bySource.pms_sync || 0)} />
              <MetricRow label="Manual Entry" value={String(data.guests.bySource.manual || 0)} />
            </div>
          </div>
        </div>

        {/* Upsell Performance */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-green-400" /> Upsell Performance
          </h2>
          <div className="space-y-3">
            <MetricRow label="Total Revenue" value={formatCents(data.upsells.totalRevenue)} highlight />
            <MetricRow label="Total Orders" value={String(data.upsells.totalOrders)} />
            <MetricRow label="Avg Order Value" value={formatCents(data.upsells.avgOrderCents)} />
            <MetricRow label="Conversion Rate" value={`${data.upsells.conversionRate}%`} highlight />
          </div>
        </div>

        {/* Email Performance */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Mail size={16} className="text-amber-400" /> Email Performance
          </h2>
          <div className="space-y-3">
            <MetricRow label="Emails Sent" value={String(data.emails.sent)} />
            <MetricRow label="Opened" value={String(data.emails.opened)} />
            <MetricRow label="Clicked" value={String(data.emails.clicked)} />
            <MetricRow label="Open Rate" value={`${openRate}%`} highlight />
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-400" /> Overview
          </h2>
          <div className="space-y-3">
            <MetricRow label="Properties" value={String(data.properties)} />
            <MetricRow label="Reservations" value={String(data.reservations)} />
            <MetricRow label="Portal Access Rate" value={`${data.portalAccessRate}%`} />
            <MetricRow label="Guest List Size" value={String(data.guests.withConsent)} highlight />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, subtext, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; subtext: string; color: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <Icon size={18} className={`${color} mb-3`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-[10px] text-gray-600 mt-0.5">{subtext}</p>
    </div>
  );
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}
