'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Lead, LeadStats, OutreachStatus, LeadTier, OutreachPriority } from '@/types/leads';

const STATUS_COLORS: Record<OutreachStatus, string> = {
  not_contacted: 'bg-gray-700 text-gray-300',
  researching: 'bg-blue-900 text-blue-300',
  contacted: 'bg-yellow-900 text-yellow-300',
  responded: 'bg-amber-900 text-amber-300',
  demo_scheduled: 'bg-purple-900 text-purple-300',
  demo_completed: 'bg-indigo-900 text-indigo-300',
  proposal_sent: 'bg-orange-900 text-orange-300',
  negotiating: 'bg-cyan-900 text-cyan-300',
  converted: 'bg-green-900 text-green-300',
  lost: 'bg-red-900 text-red-300',
  not_a_fit: 'bg-gray-800 text-gray-500',
};

const TIER_COLORS: Record<LeadTier, string> = {
  enterprise: 'bg-amber-900/50 text-amber-400 border-amber-700',
  growth: 'bg-green-900/50 text-green-400 border-green-700',
  starter: 'bg-blue-900/50 text-blue-400 border-blue-700',
  unknown: 'bg-gray-800 text-gray-400 border-gray-700',
};

const PRIORITY_COLORS: Record<OutreachPriority, string> = {
  tier_1: 'bg-red-900/50 text-red-400',
  tier_2: 'bg-orange-900/50 text-orange-400',
  tier_3: 'bg-yellow-900/50 text-yellow-400',
  monitor: 'bg-gray-700 text-gray-400',
  none: 'bg-gray-800 text-gray-500',
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState('estimated_units');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '50',
      sort: sortBy,
      order: sortOrder,
    });
    if (search) params.set('search', search);
    if (tierFilter !== 'all') params.set('tier', tierFilter);
    if (statusFilter !== 'all') params.set('outreach_status', statusFilter);
    if (priorityFilter !== 'all') params.set('outreach_priority', priorityFilter);
    if (sourceFilter !== 'all') params.set('source', sourceFilter);

    try {
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
    setLoading(false);
  }, [page, search, tierFilter, statusFilter, priorityFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (leadId: string, outreach_status: OutreachStatus) => {
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outreach_status }),
    });
    fetchLeads();
  };

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">
            {formatNumber(total)} Florida vacation rental operators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const params = new URLSearchParams();
            if (tierFilter !== 'all') params.set('tier', tierFilter);
            if (statusFilter !== 'all') params.set('outreach_status', statusFilter);
            if (search) params.set('search', search);
            window.open(`/api/leads/export?${params}`, '_blank');
          }}>
            Export CSV
          </Button>
          {selectedIds.size > 0 && (
            <BulkActions
              selectedIds={Array.from(selectedIds)}
              onComplete={() => { setSelectedIds(new Set()); fetchLeads(); }}
            />
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/leads/outreach')}>
            Outreach
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button className="bg-amber-600 hover:bg-amber-700 text-black font-semibold">
                + Import Leads
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Import Leads</DialogTitle>
              </DialogHeader>
              <ImportForm onComplete={fetchLeads} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Enterprise', value: leads.filter(l => l.tier === 'enterprise').length, color: 'text-amber-400' },
          { label: 'Growth', value: leads.filter(l => l.tier === 'growth').length, color: 'text-green-400' },
          { label: 'With Email', value: leads.filter(l => l.email).length, color: 'text-blue-400' },
          { label: 'Contacted', value: leads.filter(l => l.outreach_status !== 'not_contacted').length, color: 'text-purple-400' },
        ].map(stat => (
          <Card key={stat.label} className="bg-gray-900/50 border-gray-800 p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{formatNumber(stat.value)}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search companies, brands, emails..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 bg-gray-900 border-gray-700 text-white"
        />
        <Select value={tierFilter} onValueChange={(v) => { if (v) { setTierFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-36 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_contacted">Not Contacted</SelectItem>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { if (v) { setPriorityFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-36 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="tier_1">Tier 1</SelectItem>
            <SelectItem value="tier_2">Tier 2</SelectItem>
            <SelectItem value="tier_3">Tier 3</SelectItem>
            <SelectItem value="monitor">Monitor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(v) => { if (v) { setSourceFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="dbpr">DBPR</SelectItem>
            <SelectItem value="vrma">VRMA</SelectItem>
            <SelectItem value="pms_directory">PMS Directory</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="airbnb_vrbo">Airbnb/VRBO</SelectItem>
            <SelectItem value="association">Association</SelectItem>
            <SelectItem value="web_research">Web Research</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-800">
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  className="rounded bg-gray-800 border-gray-600"
                  checked={selectedIds.size === leads.length && leads.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(leads.map(l => l.id)));
                    else setSelectedIds(new Set());
                  }}
                />
              </th>
              {[
                { key: 'company_name', label: 'Company' },
                { key: 'tier', label: 'Tier' },
                { key: 'estimated_units', label: 'Units' },
                { key: 'market_area', label: 'Market' },
                { key: 'pms_used', label: 'PMS' },
                { key: 'outreach_priority', label: 'Priority' },
                { key: 'outreach_status', label: 'Status' },
                { key: 'email', label: 'Contact' },
                { key: 'source', label: 'Source' },
              ].map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left text-gray-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === col.key) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(col.key);
                      setSortOrder('desc');
                    }
                  }}
                >
                  {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-500">No leads found. Import your first batch!</td></tr>
            ) : (
              leads.map(lead => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded bg-gray-800 border-gray-600"
                      checked={selectedIds.has(lead.id)}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(lead.id);
                        else next.delete(lead.id);
                        setSelectedIds(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-white font-medium">{lead.brand_name || lead.company_name}</div>
                    {lead.brand_name && (
                      <div className="text-gray-500 text-xs">{lead.company_name}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={TIER_COLORS[lead.tier]}>{lead.tier}</Badge>
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {lead.estimated_units > 0 ? formatNumber(lead.estimated_units) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-400 max-w-32 truncate">{lead.market_area || '—'}</td>
                  <td className="px-3 py-2 text-gray-400">{lead.pms_used || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge className={PRIORITY_COLORS[lead.outreach_priority]}>
                      {lead.outreach_priority.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={STATUS_COLORS[lead.outreach_status]}>
                      {lead.outreach_status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {lead.email ? (
                      <span className="text-green-400 text-xs">Has email</span>
                    ) : lead.phone ? (
                      <span className="text-yellow-400 text-xs">Phone only</span>
                    ) : lead.website ? (
                      <span className="text-blue-400 text-xs">Website</span>
                    ) : (
                      <span className="text-gray-600 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{lead.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Page {page} of {totalPages} ({formatNumber(total)} leads)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">
                {selectedLead.brand_name || selectedLead.company_name}
              </DialogTitle>
            </DialogHeader>
            <LeadDetail lead={selectedLead} onStatusChange={(status) => {
              updateLeadStatus(selectedLead.id, status);
              setSelectedLead(null);
            }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LeadDetail({ lead, onStatusChange }: { lead: Lead; onStatusChange: (s: OutreachStatus) => void }) {
  return (
    <div className="space-y-4 text-sm">
      {/* Company Info */}
      <Section title="Company">
        <Field label="Company" value={lead.company_name} />
        <Field label="Brand" value={lead.brand_name} />
        <Field label="Licensee" value={lead.licensee_name} />
        <Field label="Tier" value={lead.tier} />
        <Field label="Est. Units" value={lead.estimated_units > 0 ? lead.estimated_units.toString() : null} />
        <Field label="Licenses" value={lead.license_count > 0 ? lead.license_count.toString() : null} />
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <Field label="Email" value={lead.email} link={lead.email ? `mailto:${lead.email}` : undefined} />
        <Field label="Phone" value={lead.phone} link={lead.phone ? `tel:${lead.phone}` : undefined} />
        <Field label="Website" value={lead.website} link={lead.website ? `https://${lead.website}` : undefined} />
        <Field label="Contact Person" value={lead.contact_person} />
      </Section>

      {/* Location */}
      <Section title="Location">
        <Field label="Market" value={lead.market_area} />
        <Field label="Counties" value={lead.counties?.join(', ')} />
        <Field label="Cities" value={lead.cities?.join(', ')} />
      </Section>

      {/* Intelligence */}
      <Section title="Intelligence">
        <Field label="PMS" value={lead.pms_used} />
        <Field label="Current Upsells" value={lead.current_upsells} />
        <Field label="Tech Level" value={lead.tech_sophistication} />
        <Field label="Opportunity" value={lead.guestvault_opportunity} />
        <Field label="Services" value={lead.services_offered} />
      </Section>

      {/* Enrichment */}
      {lead.enrichment_notes && (
        <Section title="Research Notes">
          <p className="text-gray-300">{lead.enrichment_notes}</p>
        </Section>
      )}

      {/* Status Change */}
      <Section title="Update Status">
        <div className="flex flex-wrap gap-2">
          {(['not_contacted', 'researching', 'contacted', 'responded', 'demo_scheduled',
            'demo_completed', 'proposal_sent', 'negotiating', 'converted', 'lost', 'not_a_fit'] as OutreachStatus[]).map(status => (
            <Button
              key={status}
              size="sm"
              variant={lead.outreach_status === status ? 'default' : 'outline'}
              className={lead.outreach_status === status ? 'bg-amber-600 text-black' : 'text-gray-400'}
              onClick={() => onStatusChange(status)}
            >
              {status.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-amber-400 font-semibold mb-2 text-xs uppercase tracking-wider">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value, link }: { label: string; value: string | null | undefined; link?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-28 shrink-0">{label}:</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className="text-gray-300 truncate">{value}</span>
      )}
    </div>
  );
}

function ImportForm({ onComplete }: { onComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const leads = Array.isArray(data) ? data : data.leads;

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, deduplicate: true }),
      });
      const json = await res.json();
      setResult(`Imported ${json.inserted} leads, skipped ${json.skipped} duplicates`);
      onComplete();
    } catch (err) {
      setResult(`Error: ${err}`);
    }
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Upload a JSON file with lead data. Format: array of objects with company_name, email, website, tier, etc.</p>
      <Input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="bg-gray-800 border-gray-700 text-white"
      />
      <Button
        onClick={handleImport}
        disabled={!file || importing}
        className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
      >
        {importing ? 'Importing...' : 'Import Leads'}
      </Button>
      {result && <p className="text-green-400 text-sm">{result}</p>}
    </div>
  );
}

function BulkActions({ selectedIds, onComplete }: { selectedIds: string[]; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleBulk = async (action: string, value?: string) => {
    setLoading(true);
    try {
      await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, lead_ids: selectedIds, value }),
      });
      onComplete();
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
    setLoading(false);
  };

  return (
    <Select onValueChange={(v: string | null) => {
      if (!v) return;
      const [action, value] = v.split(':');
      handleBulk(action, value);
    }}>
      <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
        <SelectValue placeholder={`${selectedIds.length} selected — Action`} />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700">
        <SelectItem value="update_status:contacted">Mark Contacted</SelectItem>
        <SelectItem value="update_status:researching">Mark Researching</SelectItem>
        <SelectItem value="update_status:not_a_fit">Mark Not a Fit</SelectItem>
        <SelectItem value="update_priority:tier_1">Set Priority Tier 1</SelectItem>
        <SelectItem value="update_priority:tier_2">Set Priority Tier 2</SelectItem>
        <SelectItem value="update_priority:tier_3">Set Priority Tier 3</SelectItem>
        <SelectItem value="add_tag:hot-lead">Tag: Hot Lead</SelectItem>
        <SelectItem value="add_tag:needs-research">Tag: Needs Research</SelectItem>
        <SelectItem value="delete:true">Delete Selected</SelectItem>
      </SelectContent>
    </Select>
  );
}
