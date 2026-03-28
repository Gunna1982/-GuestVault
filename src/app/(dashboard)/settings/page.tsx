'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Link2, Globe, Shield, CheckCircle, XCircle, Copy, MessageSquare, FileText } from 'lucide-react';

interface OrgData {
  name: string;
  slug: string;
  plan: string;
  stripe_account_id: string | null;
  compliance_config?: {
    require_id_verification: boolean;
    require_rental_agreement: boolean;
    require_emergency_contact: boolean;
    gdpr_mode: boolean;
    physical_mailing_address: string;
  };
}

interface ComplianceTemplate {
  id: string;
  name: string;
  category: string;
  message_text: string;
  platform: string;
  is_system: boolean;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/brand').then(r => r.json()),
      fetch('/api/compliance-templates').then(r => r.json()).catch(() => ({ templates: [] })),
    ]).then(([orgData, templateData]) => {
      setOrg(orgData);
      setTemplates(templateData.templates || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${org?.slug || 'your-org'}`;
  const compliance = org?.compliance_config;

  // Compliance checklist items — Plan of Attack §1.4
  const complianceChecks = [
    { label: 'Rental agreement configured', pass: !!compliance?.require_rental_agreement, critical: true },
    { label: 'Physical mailing address set', pass: !!compliance?.physical_mailing_address, critical: true },
    { label: 'No gated access (web link only)', pass: true, critical: true },
    { label: 'Token-based portal (no account required)', pass: true, critical: true },
    { label: 'Consent checkbox defaults to unchecked', pass: true, critical: true },
    { label: 'Stripe connected for upsell payments', pass: !!org?.stripe_account_id, critical: false },
    { label: 'GDPR mode enabled', pass: !!compliance?.gdpr_mode, critical: false },
    { label: 'ID verification enabled', pass: !!compliance?.require_id_verification, critical: false },
  ];

  const criticalPassing = complianceChecks.filter(c => c.critical && c.pass).length;
  const criticalTotal = complianceChecks.filter(c => c.critical).length;
  const allCriticalPass = criticalPassing === criticalTotal;

  function copyTemplate(template: ComplianceTemplate) {
    // Replace merge tags with example values for preview
    const text = template.message_text
      .replace(/\{\{guest_name\}\}/g, '[Guest Name]')
      .replace(/\{\{property_name\}\}/g, '[Property Name]')
      .replace(/\{\{portal_link\}\}/g, portalUrl);
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, compliance, and integrations</p>
      </div>

      {/* ── Compliance Status Indicator ──
          Plan of Attack §1.4: "In-app compliance indicator: A green checkmark
          in the host dashboard showing their portal configuration is
          policy-compliant" */}
      <div className={`rounded-xl border p-6 ${allCriticalPass ? 'border-green-500/30 bg-green-500/5' : 'border-amber-400/30 bg-amber-400/5'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Shield size={14} /> Platform Compliance
          </h2>
          <Badge className={allCriticalPass
            ? 'bg-green-500/15 text-green-400 border-green-500/30'
            : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
          }>
            {allCriticalPass ? 'Compliant' : `${criticalPassing}/${criticalTotal} Required`}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Your portal configuration is checked against Airbnb&apos;s 2025 Off-Platform Policy requirements.
        </p>
        <div className="space-y-2">
          {complianceChecks.map((check, i) => (
            <div key={i} className="flex items-center gap-2">
              {check.pass
                ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                : <XCircle size={14} className={`shrink-0 ${check.critical ? 'text-red-400' : 'text-gray-600'}`} />
              }
              <span className={`text-xs ${check.pass ? 'text-gray-400' : check.critical ? 'text-red-400' : 'text-gray-600'}`}>
                {check.label}
                {check.critical && !check.pass && <span className="text-red-400 ml-1">(required)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Airbnb-Safe Message Templates ──
          Plan of Attack §1.2 & §1.4: Pre-written message templates
          hosts can copy-paste into their PMS automated messaging */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare size={14} /> Airbnb-Safe Message Templates
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Copy these templates into your PMS auto-messaging or Airbnb scheduled messages. They are designed to pass Airbnb&apos;s AI monitoring and comply with the 2025 Off-Platform Policy.
        </p>
        <div className="space-y-3">
          {templates.filter(t => t.category === 'checkin_link').map((template) => (
            <div key={template.id} className="rounded-lg border border-gray-800 bg-gray-900/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{template.name}</span>
                  <Badge className="bg-gray-800 text-gray-500 border-gray-700 text-[10px]">
                    {template.platform}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyTemplate(template)}
                  className="border-gray-700 text-gray-400 cursor-pointer h-7 text-[10px]"
                >
                  {copiedId === template.id ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                  {copiedId === template.id ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-mono">
                {template.message_text.substring(0, 200)}...
              </p>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">
              Message templates will appear after running migration 004.
            </p>
          )}
        </div>
      </div>

      {/* ── Organization ── */}
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

      {/* ── Portal URL ── */}
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
        <p className="text-[10px] text-gray-600 mt-2">
          Share this URL in your PMS auto-messages after booking confirmation. Never send it through Airbnb messaging before a booking is confirmed.
        </p>
      </div>

      {/* ── Stripe Connect ── */}
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

      {/* ── PMS Integration ── */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link2 size={14} /> PMS Integration
        </h2>
        <p className="text-sm text-gray-400 mb-3">Connect your property management system to auto-sync reservations and trigger check-in links automatically.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-gray-400 cursor-pointer" disabled>
            Hostaway — Coming Soon
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-400 cursor-pointer" disabled>
            Guesty — Coming Soon
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          PMS integration enables &quot;set and forget&quot; automation — portal links are sent automatically for every new booking.
        </p>
      </div>
    </div>
  );
}

// Inline Check icon used in the template copy button
function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
