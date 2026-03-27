'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Wifi, Clock, Car, BookOpen, Users, Check, Loader2 } from 'lucide-react';

interface PortalData {
  reservation: {
    id: string;
    check_in: string;
    check_out: string;
    guest_count: number;
    status: string;
  };
  property: {
    name: string;
    description: string;
    property_info: {
      wifi_name?: string;
      wifi_pass?: string;
      checkout_time?: string;
      check_in_instructions?: string;
      house_rules?: string;
      parking?: string;
    };
    images: { url: string; alt?: string }[];
  } | null;
  organization: {
    name: string;
    brand_config: { primary_color: string; logo_url?: string; welcome_message?: string };
  } | null;
  guests: { id: string; first_name: string; last_name: string; email: string; is_primary: boolean }[];
  isCheckedIn: boolean;
  upsells: {
    id: string;
    category: string;
    name: string;
    description: string | null;
    price_cents: number;
    price_type: string;
    image_url: string | null;
  }[];
}

export default function GuestPortal() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  // Check-in form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadPortal() {
      const res = await fetch(`/api/portal/${token}`);
      if (!res.ok) {
        setError('This check-in link is invalid or has expired.');
        setLoading(false);
        return;
      }
      const d = await res.json();
      setData(d);
      setCheckedIn(d.isCheckedIn);
      setLoading(false);
    }
    loadPortal();
  }, [token]);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const res = await fetch(`/api/portal/${token}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone, marketing_consent: consent }),
    });

    if (!res.ok) {
      const d = await res.json();
      setFormError(d.error || 'Something went wrong');
      setSubmitting(false);
      return;
    }

    // Reload portal data to reveal property info
    const portalRes = await fetch(`/api/portal/${token}`);
    if (portalRes.ok) {
      const d = await portalRes.json();
      setData(d);
    }
    setCheckedIn(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center">
          <p className="text-xl text-white mb-2">Link Not Found</p>
          <p className="text-sm text-gray-500">{error || 'This portal link is invalid.'}</p>
        </div>
      </div>
    );
  }

  const brandColor = data.organization?.brand_config?.primary_color || '#C9A84C';
  const orgName = data.organization?.name || 'Your Host';
  const propertyName = data.property?.name || 'Property';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: brandColor }}>{orgName}</h1>
            <p className="text-xs text-gray-500">{propertyName}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>{new Date(data.reservation.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(data.reservation.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        {!checkedIn ? (
          /* ── Check-In Form ── */
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <p className="text-sm text-gray-400 mt-2">
                {data.organization?.brand_config?.welcome_message || `Complete your check-in to access WiFi, house rules, and everything you need for your stay at ${propertyName}.`}
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4">
              {formError && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">First Name *</label>
                  <input
                    type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email *</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone (optional)</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  placeholder="(555) 123-4567"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded border-gray-700 bg-gray-900 text-amber-400 focus:ring-amber-400"
                />
                <span className="text-xs text-gray-400">
                  I&apos;d like to receive updates, special offers, and local recommendations from {orgName}. You can unsubscribe anytime.
                </span>
              </label>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                style={{ background: brandColor, color: '#0a0a12' }}
              >
                {submitting ? 'Checking in...' : 'Check In & Get WiFi'}
              </button>

              <p className="text-[10px] text-gray-600 text-center">
                Your information is stored securely and never shared with third parties.
              </p>
            </form>
          </div>
        ) : (
          /* ── Property Info (revealed after check-in) ── */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${brandColor}20` }}>
                <Check size={24} style={{ color: brandColor }} />
              </div>
              <h2 className="text-xl font-bold">You&apos;re Checked In!</h2>
              <p className="text-sm text-gray-400 mt-1">Here&apos;s everything you need for your stay.</p>
            </div>

            {/* WiFi Card — THE CARROT */}
            {data.property?.property_info?.wifi_name && (
              <div className="rounded-xl border-2 p-5" style={{ borderColor: `${brandColor}40`, background: `${brandColor}08` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Wifi size={18} style={{ color: brandColor }} />
                  <h3 className="font-semibold text-white">WiFi</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Network</p>
                    <p className="text-sm text-white font-mono mt-1">{data.property.property_info.wifi_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Password</p>
                    <p className="text-sm text-white font-mono mt-1">{data.property.property_info.wifi_pass || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Check-out Time */}
            {data.property?.property_info?.checkout_time && (
              <InfoCard icon={Clock} title="Check-out Time" color={brandColor}>
                <p className="text-sm text-gray-300">{data.property.property_info.checkout_time}</p>
              </InfoCard>
            )}

            {/* Check-in Instructions */}
            {data.property?.property_info?.check_in_instructions && (
              <InfoCard icon={BookOpen} title="Check-in Instructions" color={brandColor}>
                <p className="text-sm text-gray-300 whitespace-pre-line">{data.property.property_info.check_in_instructions}</p>
              </InfoCard>
            )}

            {/* House Rules */}
            {data.property?.property_info?.house_rules && (
              <InfoCard icon={BookOpen} title="House Rules" color={brandColor}>
                <p className="text-sm text-gray-300 whitespace-pre-line">{data.property.property_info.house_rules}</p>
              </InfoCard>
            )}

            {/* Parking */}
            {data.property?.property_info?.parking && (
              <InfoCard icon={Car} title="Parking" color={brandColor}>
                <p className="text-sm text-gray-300">{data.property.property_info.parking}</p>
              </InfoCard>
            )}

            {/* Upsell Storefront */}
            {data.upsells && data.upsells.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: brandColor }}>
                  Enhance Your Stay
                </h3>
                <div className="space-y-3">
                  {data.upsells.map((upsell) => {
                    const price = (upsell.price_cents / 100).toFixed(upsell.price_cents % 100 === 0 ? 0 : 2);
                    const suffix = upsell.price_type === 'per_person' ? '/person' : upsell.price_type === 'per_night' ? '/night' : '';
                    return (
                      <div key={upsell.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 hover:border-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{upsell.name}</h4>
                            {upsell.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{upsell.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-lg font-bold" style={{ color: brandColor }}>${price}<span className="text-xs text-gray-500">{suffix}</span></p>
                            <button
                              className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              style={{ background: brandColor, color: '#0a0a12' }}
                              onClick={() => alert('Stripe checkout coming soon!')}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Travel Companions */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-gray-500" />
                <h3 className="font-semibold text-white text-sm">Traveling with others?</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Share this link with your travel companions so they can check in too.</p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-xs px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors cursor-pointer"
              >
                Copy Check-in Link
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-[10px] text-gray-600">Powered by GuestVault</p>
      </footer>
    </div>
  );
}

function InfoCard({ icon: Icon, title, color, children }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} style={{ color }} />
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
