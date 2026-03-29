'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Send,
  Eye,
  History,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  property_name?: string;
  status: string;
  priority: string;
  date_last_contacted?: string;
}

interface OutreachStats {
  total_contacted: number;
  total_emails_sent: number;
  pending_leads: number;
  response_rate: number;
}

export default function OutreachPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<OutreachStats>({
    total_contacted: 0,
    total_emails_sent: 0,
    pending_leads: 0,
    response_rate: 0,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/leads/outreach/templates');
        const data = await res.json();
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0].id);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Load leads and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // In a real app, these would come from actual API calls
        // For now, we'll load mock data
        const mockLeads: Lead[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            property_name: 'Beachfront Paradise',
            status: 'new',
            priority: 'high',
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            property_name: 'Miami Sunset Retreat',
            status: 'new',
            priority: 'high',
          },
          {
            id: '3',
            name: 'Mike Davis',
            email: 'mike@example.com',
            property_name: 'Coral Springs Villa',
            status: 'contacted',
            priority: 'medium',
            date_last_contacted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setLeads(mockLeads);

        const mockStats: OutreachStats = {
          total_contacted: 12,
          total_emails_sent: 18,
          pending_leads: 8,
          response_rate: 0.25,
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const statusMatch = statusFilter === 'all' || lead.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || lead.priority === priorityFilter;
    const hasEmail = !!lead.email;
    return statusMatch && priorityMatch && hasEmail;
  });

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handlePreview = (lead: Lead, template: EmailTemplate) => {
    setPreviewLead(lead);
    setPreviewTemplate(template);
  };

  const handleSendEmails = async () => {
    if (!selectedTemplate || selectedLeads.size === 0) return;

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setSending(true);
    setSuccessCount(0);
    let successCount = 0;

    try {
      // Send emails in batches (max 10 at a time as specified)
      const leadsToSend = Array.from(selectedLeads);
      const maxBatchSize = 10;

      for (let i = 0; i < leadsToSend.length; i += maxBatchSize) {
        const batch = leadsToSend.slice(i, i + maxBatchSize);

        const results = await Promise.all(
          batch.map((leadId) =>
            fetch('/api/leads/outreach', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_id: leadId,
                template: selectedTemplate,
              }),
            }).catch(() => ({ ok: false }))
          )
        );

        const batchSuccesses = results.filter((r) => r.ok).length;
        successCount += batchSuccesses;

        // Small delay between batches
        if (i + maxBatchSize < leadsToSend.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setSuccessCount(successCount);
      setSelectedLeads(new Set());

      // Refresh stats
      setStats((prev) => ({
        ...prev,
        total_emails_sent: prev.total_emails_sent + successCount,
        total_contacted: prev.total_contacted + successCount,
      }));
    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setSending(false);
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Outreach Campaign</h1>
          <p className="text-gray-400">Send targeted emails to your leads using predefined templates</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <BarChart3 className="h-4 w-4" />
                Total Contacted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_contacted}</div>
              <p className="text-xs text-gray-500">Leads reached out to</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <Mail className="h-4 w-4" />
                Emails Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_emails_sent}</div>
              <p className="text-xs text-gray-500">Total outreach emails</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending_leads}</div>
              <p className="text-xs text-gray-500">Leads not contacted yet</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <Zap className="h-4 w-4" />
                Response Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(stats.response_rate * 100)}%</div>
              <p className="text-xs text-gray-500">Reply rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Templates & Configuration */}
          <div className="space-y-6 lg:col-span-1">
            {/* Template Selection */}
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Email Templates</CardTitle>
                <CardDescription>Choose a template for your outreach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTemplate} onValueChange={(v) => v && setSelectedTemplate(v)}>
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentTemplate && (
                  <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Subject Line</p>
                      <p className="mt-1 text-sm text-gray-200">{currentTemplate.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Description</p>
                      <p className="mt-1 text-sm text-gray-300">{currentTemplate.description}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
                  <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-900">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Priority</label>
                  <Select value={priorityFilter} onValueChange={(v) => v && setPriorityFilter(v)}>
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-900">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Send Button */}
            <Card className="border-amber-600 bg-gradient-to-br from-amber-950 to-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Ready to Send?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-amber-400">{selectedLeads.size}</span> lead
                    {selectedLeads.size !== 1 ? 's' : ''} selected
                  </p>
                  {selectedLeads.size > 10 && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
                      <AlertCircle className="h-3 w-3" />
                      Will send in batches of 10
                    </p>
                  )}
                  {successCount > 0 && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {successCount} email{successCount !== 1 ? 's' : ''} sent successfully
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendEmails}
                  disabled={selectedLeads.size === 0 || !selectedTemplate || sending}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {sending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send {selectedLeads.size > 0 ? `to ${selectedLeads.size}` : 'Emails'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Leads List */}
          <div className="lg:col-span-2">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Select Leads</CardTitle>
                    <CardDescription>
                      {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-gray-400">Loading leads...</p>
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-gray-400">No leads match your filters</p>
                      </div>
                    ) : (
                      filteredLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className={cn(
                            'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                            selectedLeads.has(lead.id)
                              ? 'border-amber-600 bg-amber-950/20'
                              : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-100">{lead.name}</p>
                            <p className="text-sm text-gray-400">{lead.property_name}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
                                  lead.status === 'new'
                                    ? 'bg-blue-900/40 text-blue-300'
                                    : lead.status === 'contacted'
                                      ? 'bg-amber-900/40 text-amber-300'
                                      : 'bg-green-900/40 text-green-300'
                                )}
                              >
                                {lead.status}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
                                  lead.priority === 'high'
                                    ? 'bg-red-900/40 text-red-300'
                                    : lead.priority === 'medium'
                                      ? 'bg-yellow-900/40 text-yellow-300'
                                      : 'bg-gray-700/40 text-gray-300'
                                )}
                              >
                                {lead.priority}
                              </span>
                            </div>
                          </div>
                          {currentTemplate && (
                            <Dialog>
                              <DialogTrigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(lead, currentTemplate)}
                                  className="text-gray-400 hover:text-amber-400"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {previewLead && previewTemplate && (
                                <DialogContent className="border-gray-700 bg-gray-900 max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Email Preview</DialogTitle>
                                    <DialogDescription>
                                      To: {previewLead.name} ({previewLead.email})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-gray-400 uppercase">
                                        Subject
                                      </p>
                                      <p className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-100">
                                        {previewTemplate.subject}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-gray-400 uppercase">
                                        Body
                                      </p>
                                      <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 p-3">
                                        <p className="whitespace-pre-wrap text-sm text-gray-200">
                                          {previewTemplate.body
                                            .replace('[Guest Name]', previewLead.name)
                                            .replace(
                                              '[Property Name]',
                                              previewLead.property_name || 'your property'
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
