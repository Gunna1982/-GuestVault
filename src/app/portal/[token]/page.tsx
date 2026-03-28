'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Wifi, Clock, Car, BookOpen, Users, Check, Loader2, ShoppingBag, Shield, FileText, Phone, ChevronDown, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComplianceConfig {
  require_id_verification: boolean;
  require_rental_agreement: boolean;
  require_emergency_contact: boolean;
  gdpr_mode: boolean;
  physical_mailing_address: string;
}

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
    compliance_config: ComplianceConfig;
  } | null;
  guests: { id: string; first_name: string; last_name: string; email: string; is_primary: boolean }[];
  isCheckedIn: boolean;
  rentalAgreement: { id: string; title: string; body_text: string } | null;
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

// ─── Compliance Steps ───────────────────────────────────────────────────────
// Based on Plan of Attack §1.1:
// Step 1: Digital Check-In & ID Verification (data capture as regulatory requirement)
// Step 2: Rental Agreement & House Rules (paper trail + deeper engagement)
// Step 3: Emergency Contact Collection (phone capture under safety umbrella)
// Step 4: Property Access & WiFi (the reward)
// Step 5: Optional Enhance Your Stay (upsells - clearly separated)

type PortalStep = 'checkin' | 'agreement' | 'property_info' | 'complete';

export default function GuestPortal() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<PortalStep>('checkin');

  // Check-in form (Step 1: Identity & Data Capture)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [idDocType, setIdDocType] = useState('');
  // COMPLIANCE: consent defaults to FALSE (GDPR-compliant, Plan of Attack §1.1)
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Rental Agreement (Step 2)
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [agreementExpanded, setAgreementExpanded] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);

  // Upsell checkout
  const [checkoutUpsell, setCheckoutUpsell] = useState<PortalData['upsells'][0] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const compliance = data?.organization?.compliance_config;
  const brandColor = data?.organization?.brand_config?.primary_color || '#C9A84C';
  const orgName = data?.organization?.name || 'Your Host';
  const propertyName = data?.property?.name || 'Property';

  // Load portal data
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

      // Determine which step to show
      if (d.isCheckedIn) {
        // Check if rental agreement still needs acceptance
        if (d.rentalAgreement && !d.agreementAccepted) {
          setCurrentStep('agreement');
        } else {
          setCurrentStep('complete');
        }
      } else {
        setCurrentStep('checkin');
      }
      setLoading(false);
    }
    loadPortal();
  }, [token]);

  // ─── Step 1: Check-In Submission ──────────────────────────────────────────
  // "The guest experiences a compliance flow that happens to capture their email.
  //  They do NOT experience a marketing funnel that happens to include check-in info."

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const res = await fetch(`/api/portal/${token}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        emergency_phone: emergencyPhone || null,
        id_document_type: idDocType || null,
        marketing_consent: marketingConsent,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setFormError(d.error || 'Something went wrong');
      setSubmitting(false);
      return;
    }

    // Reload portal data
    const portalRes = await fetch(`/api/portal/${token}`);
    if (portalRes.ok) {
      const d = await portalRes.json();
      setData(d);

      // Move to next step based on compliance config
      if (d.rentalAgreement && !d.agreementAccepted) {
        setCurrentStep('agreement');
      } else {
        setCurrentStep('complete');
      }
    }
    setSubmitting(false);
  }

  // ─── Step 2: Rental Agreement Acceptance ──────────────────────────────────

  async function handleAcceptAgreement() {
    if (!agreementAccepted) return;
    setAcceptingAgreement(true);

    const res = await fetch(`/api/portal/${token}/checkin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accept_rental_agreement: true,
        rental_agreement_id: data?.rentalAgreement?.id,
      }),
    });

    if (res.ok) {
      setCurrentStep('complete');
    }
    setAcceptingAgreement(false);
  }

  // ─── Upsell Checkout ─────────────────────────────────────────────────────

  async function startCheckout(upsell: PortalData['upsells'][0]) {
    setCheckoutUpsell(upsell);
    try {
      const res = await fetch(`/api/portal/${token}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upsell_id: upsell.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        alert(data.error || 'Payment setup failed');
        setCheckoutUpsell(null);
      }
    } catch {
      alert('Something went wrong');
      setCheckoutUpsell(null);
    }
  }

  // ─── Loading / Error States ───────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────────

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

        {/* ════════════════════════════════════════════════════════════════════
            STEP 1: DIGITAL CHECK-IN & IDENTITY VERIFICATION
            Plan of Attack §1.1: "Local regulations require us to verify
            guest identity. Please provide your name, email, and upload
            a photo ID."
            ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'checkin' && (
          <div className="space-y-6">
            {/* Compliance-first framing */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${brandColor}15` }}>
                <Shield size={26} style={{ color: brandColor }} />
              </div>
              <h2 className="text-2xl font-bold">Digital Check-In</h2>
              <p className="text-sm text-gray-400 mt-2">
                Please verify your identity to access your property details, WiFi password, and digital guide for {propertyName}.
              </p>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-2">
              <StepDot active={true} label="1" color={brandColor} />
              <StepLine />
              <StepDot active={false} label="2" color={brandColor} />
              <StepLine />
              <StepDot active={false} label="3" color={brandColor} />
            </div>
            <p className="text-center text-[10px] text-gray-600">Step 1 of {data.rentalAgreement ? '3' : '2'}: Guest Verification</p>

            <form onSubmit={handleCheckIn} className="space-y-4">
              {formError && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>
              )}

              {/* Identity Section - Framed as compliance requirement */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-gray-500" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Guest Verification</p>
                </div>

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
                    <label className="block text-xs text-gray-400 mb-1">Last Name *</label>
                    <input
                      type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    placeholder="your@email.com"
                  />
                </div>

                {/* ID Document Type — only shown when org requires it */}
                {compliance?.require_id_verification && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ID Document Type *</label>
                    <select
                      value={idDocType} onChange={(e) => setIdDocType(e.target.value)} required
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50 appearance-none"
                    >
                      <option value="">Select document type</option>
                      <option value="drivers_license">Driver&apos;s License</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="other">Other Government ID</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Safety Contact Section — framed under safety umbrella */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={14} className="text-gray-500" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contact & Safety</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Phone Number {compliance?.require_emergency_contact ? '*' : '(optional)'}
                  </label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    required={compliance?.require_emergency_contact}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">For safety purposes — we may need to reach you during your stay.</p>
                </div>

                {compliance?.require_emergency_contact && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Emergency Contact Phone *</label>
                    <input
                      type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-400/50"
                      placeholder="Emergency contact number"
                    />
                  </div>
                )}
              </div>

              {/* Marketing Consent — SEPARATE and OPTIONAL
                  Plan of Attack: "The compliance function is never conditional
                  on engaging with commerce."
                  GDPR: consent defaults to false, must be affirmative action */}
              <div className="rounded-xl border border-gray-800/50 bg-gray-900/20 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 rounded border-gray-700 bg-gray-900 text-amber-400 focus:ring-amber-400"
                  />
                  <span className="text-xs text-gray-500">
                    I&apos;d like to receive occasional emails about special offers, local recommendations, and exclusive booking opportunities from {orgName}. You can unsubscribe at any time.
                  </span>
                </label>
                <p className="text-[10px] text-gray-700 mt-2 pl-7">This is optional and does not affect your check-in or WiFi access.</p>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                style={{ background: brandColor, color: '#0a0a12' }}
              >
                {submitting ? 'Verifying...' : 'Complete Verification & Continue'}
              </button>

              <p className="text-[10px] text-gray-600 text-center">
                Your information is stored securely and processed only for property management and stay-related services.
                {' '}<a href="/privacy" className="underline hover:text-gray-400" target="_blank">Privacy Policy</a>
              </p>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 2: RENTAL AGREEMENT & HOUSE RULES
            Plan of Attack §1.1: "Digital signature on property rules.
            This creates a paper trail that protects the host legally
            while deepening the guest's engagement with the portal."
            ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'agreement' && data.rentalAgreement && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${brandColor}15` }}>
                <FileText size={26} style={{ color: brandColor }} />
              </div>
              <h2 className="text-2xl font-bold">House Rules & Agreement</h2>
              <p className="text-sm text-gray-400 mt-2">
                Please review and accept the property rules for your stay at {propertyName}.
              </p>
            </div>

            {/* Step Progress */}
            <div className="flex items-center justify-center gap-2">
              <StepDot active={false} completed label="1" color={brandColor} />
              <StepLine completed />
              <StepDot active={true} label="2" color={brandColor} />
              <StepLine />
              <StepDot active={false} label="3" color={brandColor} />
            </div>
            <p className="text-center text-[10px] text-gray-600">Step 2 of 3: Property Agreement</p>

            {/* Agreement Content */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              <button
                onClick={() => setAgreementExpanded(!agreementExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-900/50 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">{data.rentalAgreement.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Click to {agreementExpanded ? 'collapse' : 'read full agreement'}</p>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${agreementExpanded ? 'rotate-180' : ''}`} />
              </button>
              {agreementExpanded && (
                <div className="px-5 pb-5 border-t border-gray-800">
                  <div className="text-xs text-gray-400 whitespace-pre-line mt-4 max-h-64 overflow-y-auto leading-relaxed">
                    {data.rentalAgreement.body_text}
                  </div>
                </div>
              )}
            </div>

            {/* Acceptance */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementAccepted}
                onChange={(e) => setAgreementAccepted(e.target.checked)}
                className="mt-1 rounded border-gray-700 bg-gray-900 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-xs text-gray-400">
                I have read and agree to the house rules and rental agreement for {propertyName}.
              </span>
            </label>

            <button
              onClick={handleAcceptAgreement}
              disabled={!agreementAccepted || acceptingAgreement}
              className="w-full py-3.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
              style={{ background: agreementAccepted ? brandColor : '#374151', color: agreementAccepted ? '#0a0a12' : '#9CA3AF' }}
            >
              {acceptingAgreement ? 'Saving...' : 'Accept & Access Your Property Guide'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 3: PROPERTY ACCESS & GUIDE (THE REWARD)
            Plan of Attack §1.1: "After completing the compliance steps,
            the guest unlocks door codes, WiFi password, parking instructions,
            and the full property guide. This is the carrot."
            ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'complete' && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${brandColor}20` }}>
                <Check size={24} style={{ color: brandColor }} />
              </div>
              <h2 className="text-xl font-bold">You&apos;re All Set!</h2>
              <p className="text-sm text-gray-400 mt-1">Here&apos;s everything you need for your stay at {propertyName}.</p>
            </div>

            {/* ── COMPLIANCE SECTION: Property Access ── */}
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

            {/* ── COMMERCE SECTION: Optional Enhancements ──
                Plan of Attack §1.1: "The upsell storefront appears below the
                property info. It is clearly positioned as optional enhancements,
                not mandatory fees. This distinction is critical for 2025 fee
                transparency rules."

                VISUALLY SEPARATED from compliance section */}
            {data.upsells && data.upsells.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag size={14} style={{ color: brandColor }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: brandColor }}>
                    Enhance Your Stay
                  </h3>
                </div>
                <p className="text-[10px] text-gray-600 mb-4">Optional add-ons to make your visit even better.</p>
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
                              onClick={() => startCheckout(upsell)}
                            >
                              {checkoutUpsell?.id === upsell.id ? 'Processing...' : 'Add'}
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

      {/* Stripe Checkout Modal */}
      {clientSecret && checkoutUpsell && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{checkoutUpsell.name}</h3>
              <button onClick={() => { setClientSecret(null); setCheckoutUpsell(null); }} className="text-gray-500 hover:text-white cursor-pointer text-xl">&times;</button>
            </div>
            <p className="text-2xl font-bold mb-4" style={{ color: brandColor }}>
              ${(checkoutUpsell.price_cents / 100).toFixed(checkoutUpsell.price_cents % 100 === 0 ? 0 : 2)}
            </p>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: brandColor } } }}>
              <CheckoutForm
                brandColor={brandColor}
                onSuccess={() => {
                  setClientSecret(null);
                  setCheckoutUpsell(null);
                  setOrderSuccess(checkoutUpsell.name);
                  setTimeout(() => setOrderSuccess(null), 5000);
                }}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* Order Success Toast */}
      {orderSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-2">
          <Check size={18} /> {orderSuccess} — confirmed!
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center space-y-1">
        <p className="text-[10px] text-gray-600">Powered by StaySteward</p>
        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-700">
          <a href="/privacy" className="hover:text-gray-500" target="_blank">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-gray-500" target="_blank">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StepDot({ active, completed, label, color }: { active: boolean; completed?: boolean; label: string; color: string }) {
  if (completed) {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#0a0a12' }}>
        <Check size={14} />
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
      style={{
        background: active ? `${color}20` : 'transparent',
        borderColor: active ? color : '#374151',
        color: active ? color : '#6B7280',
      }}
    >
      {label}
    </div>
  );
}

function StepLine({ completed }: { completed?: boolean } = {}) {
  return <div className={`w-8 h-0.5 ${completed ? 'bg-amber-400' : 'bg-gray-800'}`} />;
}

function CheckoutForm({ brandColor, onSuccess }: { brandColor: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setProcessing(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 py-3 rounded-lg font-semibold text-sm disabled:opacity-50 cursor-pointer"
        style={{ background: brandColor, color: '#0a0a12' }}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
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
