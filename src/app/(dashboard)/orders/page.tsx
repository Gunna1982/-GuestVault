'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  quantity: number;
  amount_cents: number;
  host_payout_cents: number;
  platform_fee_cents: number;
  status: string;
  created_at: string;
  upsell_templates: { name: string; category: string } | null;
  guests: { first_name: string; last_name: string; email: string } | null;
  reservations: { check_in: string; check_out: string; properties: { name: string } | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  paid: 'bg-green-500/15 text-green-400 border-green-500/30',
  fulfilled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  refunded: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrder: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => {
      setOrders(d.orders || []);
      setStats(d.stats || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <DollarSign size={16} className="text-green-400 mb-2" />
          <p className="text-xl font-bold text-white">${(stats.totalRevenue / 100).toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">Total Revenue</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <Package size={16} className="text-blue-400 mb-2" />
          <p className="text-xl font-bold text-white">{stats.totalOrders}</p>
          <p className="text-[10px] text-gray-500">Paid Orders</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <DollarSign size={16} className="text-amber-400 mb-2" />
          <p className="text-xl font-bold text-white">${(stats.avgOrder / 100).toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">Avg Order</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <Package size={16} className="text-amber-400 mb-2" />
          <p className="text-xl font-bold text-white">{stats.pendingCount}</p>
          <p className="text-[10px] text-gray-500">Pending</p>
        </div>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
          <Package size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No orders yet</p>
          <p className="text-xs text-gray-600">Orders will appear here when guests purchase upsells</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{order.upsell_templates?.name || 'Unknown service'}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.guests?.first_name} {order.guests?.last_name} &middot; {order.reservations?.properties?.name || 'Unknown property'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">${(order.host_payout_cents / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-600">${(order.platform_fee_cents / 100).toFixed(2)} platform fee</p>
                  <Badge className={`mt-1 ${STATUS_COLORS[order.status] || ''}`}>{order.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
