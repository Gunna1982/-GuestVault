'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Plus, Copy, ExternalLink, Users } from 'lucide-react';

interface ReservationWithProperty {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  channel: string;
  status: string;
  portal_token: string;
  portal_accessed_at: string | null;
  total_amount: number | null;
  created_at: string;
  properties: { name: string; slug: string };
}

interface Property {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  checked_in: 'bg-green-500/15 text-green-400 border-green-500/30',
  checked_out: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const PORTAL_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://guest-vault.vercel.app';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Form
  const [propertyId, setPropertyId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [channel, setChannel] = useState('airbnb');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const fetchData = useCallback(async () => {
    const [resRes, propRes] = await Promise.all([
      fetch('/api/reservations'),
      fetch('/api/properties'),
    ]);
    if (resRes.ok) setReservations(await resRes.json());
    if (propRes.ok) setProperties(await propRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: parseInt(guestCount) || 1,
        channel,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed to create');
      setSaving(false);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    setPropertyId(''); setCheckIn(''); setCheckOut(''); setGuestCount('1'); setGuestName(''); setGuestEmail('');
    fetchData();
  }

  function copyPortalLink(token: string) {
    navigator.clipboard.writeText(`${PORTAL_BASE}/portal/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservations</h1>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} total</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
          <Plus size={16} className="mr-2" /> Add Reservation
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <div>
              <Label className="text-gray-400 text-xs">Property *</Label>
              <select
                value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm mt-1 focus:outline-none cursor-pointer"
              >
                <option value="">Select property</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400 text-xs">Check-in *</Label>
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required className="bg-gray-800 border-gray-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Check-out *</Label>
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required className="bg-gray-800 border-gray-700 text-white mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400 text-xs">Guests</Label>
                <Input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Channel</Label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm mt-1 cursor-pointer">
                  <option value="airbnb">Airbnb</option>
                  <option value="vrbo">Vrbo</option>
                  <option value="booking">Booking.com</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <p className="text-xs text-gray-500 mb-3">Guest info (optional — they can fill this in via the portal)</p>
              <div className="grid grid-cols-2 gap-3">
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" className="bg-gray-800 border-gray-700 text-white" />
                <Input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Guest email" className="bg-gray-800 border-gray-700 text-white" />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
              {saving ? 'Creating...' : 'Create Reservation'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reservation List */}
      {reservations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
          <CalendarDays size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No reservations yet</p>
          <p className="text-xs text-gray-600">Add a reservation to generate a guest check-in link</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{r.properties?.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(r.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(r.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[r.status] || ''}>{r.status.replace('_', ' ')}</Badge>
                  <Badge variant="outline" className="text-gray-500 border-gray-700 text-xs">{r.channel}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Users size={12} /> {r.guest_count} guests</span>
                {r.portal_accessed_at && <span className="text-green-400">Portal accessed</span>}
                {!r.portal_accessed_at && <span className="text-yellow-400">Not yet accessed</span>}
              </div>

              {/* Portal Link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-xs text-gray-400 font-mono truncate">
                  {PORTAL_BASE}/portal/{r.portal_token.slice(0, 20)}...
                </div>
                <Button
                  size="sm" variant="outline"
                  onClick={() => copyPortalLink(r.portal_token)}
                  className="text-xs border-gray-700 cursor-pointer"
                >
                  {copied === r.portal_token ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied === r.portal_token ? ' Copied' : ' Copy'}
                </Button>
                <a
                  href={`${PORTAL_BASE}/portal/${r.portal_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} /> Preview
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}><path d="M20 6L9 17l-5-5"/></svg>;
}
