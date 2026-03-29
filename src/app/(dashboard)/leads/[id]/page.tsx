'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import type { Lead, LeadActivity, OutreachStatus, ActivityType } from '@/types/leads';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Send,
  Plus,
  Edit2,
  X,
  Check,
  FileText,
  MessageSquare,
  Zap,
} from 'lucide-react';

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

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  note: <MessageSquare className="w-4 h-4" />,
  email_sent: <Mail className="w-4 h-4" />,
  email_received: <Mail className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  demo: <Zap className="w-4 h-4" />,
  proposal: <FileText className="w-4 h-4" />,
  status_change: <Check className="w-4 h-4" />,
  research: <Globe className="w-4 h-4" />,
  import: <Plus className="w-4 h-4" />,
};

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = (now.getTime() - date.getTime()) / 1000;

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface EditingField {
  field: keyof Lead;
  value: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [paramId, setParamId] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [newActivity, setNewActivity] = useState('');
  const [newActivityType, setNewActivityType] = useState<ActivityType>('note');
  const [addingActivity, setAddingActivity] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setParamId(p.id));
  }, [params]);

  // Fetch lead data
  useEffect(() => {
    if (!paramId) return;

    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/leads/${paramId}`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        const data = await res.json();
        setLead(data.lead);
        setActivities(data.activities || []);
      } catch (err) {
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [paramId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Lead not found</p>
        <Button onClick={() => router.push('/leads')}>Back to Leads</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OutreachStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${paramId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedLead = await res.json();
      setLead(updatedLead);

      // Refresh activities to show status change
      const activitiesRes = await fetch(`/api/leads/${paramId}/activities`);
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleFieldUpdate = async (field: keyof Lead, value: string) => {
    setUpdating(true);
    try {
      const updateData: Record<string, unknown> = { [field]: value };

      // Handle specific field types
      if (field === 'estimated_units' || field === 'license_count') {
        updateData[field] = parseInt(value) || 0;
      }

      const res = await fetch(`/api/leads/${paramId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update lead');
      const updatedLead = await res.json();
      setLead(updatedLead);
      setEditingField(null);
    } catch (err) {
      console.error('Error updating field:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;

    setAddingActivity(true);
    try {
      const res = await fetch(`/api/leads/${paramId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: newActivityType,
          title: newActivity,
          description: newActivity,
        }),
      });
      if (!res.ok) throw new Error('Failed to add activity');

      // Refresh activities
      const activitiesRes = await fetch(`/api/leads/${paramId}/activities`);
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);
      setNewActivity('');
      setNewActivityType('note');
      setDialogOpen(false);
    } catch (err) {
      console.error('Error adding activity:', err);
    } finally {
      setAddingActivity(false);
    }
  };

  const handleQuickAction = async (action: OutreachStatus, activityType: ActivityType, activityTitle: string) => {
    // Update status
    await handleStatusChange(action);

    // Add activity
    setAddingActivity(true);
    try {
      await fetch(`/api/leads/${paramId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: activityType,
          title: activityTitle,
        }),
      });

      // Refresh activities
      const activitiesRes = await fetch(`/api/leads/${paramId}/activities`);
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);
    } catch (err) {
      console.error('Error with quick action:', err);
    } finally {
      setAddingActivity(false);
    }
  };

  const EditableField = ({
    label,
    field,
    value,
    type = 'text'
  }: {
    label: string;
    field: keyof Lead;
    value: string | number | null;
    type?: string;
  }) => {
    const isEditing = editingField?.field === field;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <div className="flex gap-2">
            <Input
              type={type}
              value={editingField.value}
              onChange={(e) =>
                setEditingField({ ...editingField, value: e.target.value })
              }
              className="bg-gray-800 border-gray-700 text-white"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => handleFieldUpdate(field, editingField.value)}
              disabled={updating}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setEditingField(null)}
              variant="outline"
              className="border-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded transition"
        onClick={() =>
          setEditingField({ field, value: String(value || '') })
        }
      >
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center justify-between">
          <p className="text-white">{value || '-'}</p>
          <Edit2 className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/leads')}
            variant="outline"
            size="sm"
            className="border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{lead.company_name}</h1>
            {lead.brand_name && (
              <p className="text-gray-400 text-sm">Brand: {lead.brand_name}</p>
            )}
          </div>
        </div>
        <Badge className={STATUS_COLORS[lead.outreach_status]}>
          {lead.outreach_status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-300 mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() =>
              handleQuickAction('contacted', 'call', 'Marked as contacted')
            }
            disabled={updating || addingActivity}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            Mark Contacted
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleQuickAction('demo_scheduled', 'demo', 'Demo scheduled')
            }
            disabled={updating || addingActivity}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Demo
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Note Type
                  </label>
                  <Select
                    value={newActivityType}
                    onValueChange={(value) => setNewActivityType(value as ActivityType)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="email_sent">Email Sent</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Note
                  </label>
                  <Textarea
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="Enter your note..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setDialogOpen(false)}
                    variant="outline"
                    className="border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddActivity}
                    disabled={addingActivity || !newActivity.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {addingActivity ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Change */}
      <Card className="bg-gray-900/50 border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Update Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {(
            [
              'not_contacted',
              'researching',
              'contacted',
              'responded',
              'demo_scheduled',
              'demo_completed',
              'proposal_sent',
              'negotiating',
              'converted',
              'lost',
              'not_a_fit',
            ] as OutreachStatus[]
          ).map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating || lead.outreach_status === status}
              variant={lead.outreach_status === status ? 'default' : 'outline'}
              size="sm"
              className={
                lead.outreach_status === status
                  ? `${STATUS_COLORS[status]}`
                  : 'border-gray-700 hover:border-gray-600'
              }
            >
              {status.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Company</h2>
            <div className="space-y-4">
              <EditableField
                label="Company Name"
                field="company_name"
                value={lead.company_name}
              />
              <EditableField
                label="Brand Name"
                field="brand_name"
                value={lead.brand_name}
              />
              <EditableField
                label="Licensee Name"
                field="licensee_name"
                value={lead.licensee_name}
              />
            </div>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="flex items-center gap-2">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
                    >
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </a>
                  )}
                  {!lead.email && <span className="text-gray-500">-</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Phone</label>
                <div className="flex items-center gap-2">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
                    >
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </a>
                  )}
                  {!lead.phone && <span className="text-gray-500">-</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Website</label>
                <div className="flex items-center gap-2">
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
                    >
                      <Globe className="w-4 h-4" />
                      {lead.website}
                    </a>
                  )}
                  {!lead.website && <span className="text-gray-500">-</span>}
                </div>
              </div>
              <EditableField
                label="Contact Person"
                field="contact_person"
                value={lead.contact_person}
              />
            </div>
          </Card>

          {/* Location Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">State</label>
                <p className="text-white">{lead.state}</p>
              </div>
              <EditableField
                label="Market Area"
                field="market_area"
                value={lead.market_area}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Counties</label>
                <p className="text-white text-sm">
                  {lead.counties?.length > 0 ? lead.counties.join(', ') : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Cities</label>
                <p className="text-white text-sm">
                  {lead.cities?.length > 0 ? lead.cities.join(', ') : '-'}
                </p>
              </div>
              <EditableField
                label="Mailing Address"
                field="mailing_address"
                value={lead.mailing_address}
              />
            </div>
          </Card>

          {/* Intelligence Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Intelligence</h2>
            <div className="space-y-4">
              <EditableField
                label="PMS Used"
                field="pms_used"
                value={lead.pms_used}
              />
              <EditableField
                label="Tech Sophistication"
                field="tech_sophistication"
                value={lead.tech_sophistication}
              />
              <EditableField
                label="Current Upsells"
                field="current_upsells"
                value={lead.current_upsells}
              />
              <EditableField
                label="Services Offered"
                field="services_offered"
                value={lead.services_offered}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  GuestVault Opportunity
                </label>
                <p className="text-white text-sm">
                  {lead.guestvault_opportunity || '-'}
                </p>
              </div>
            </div>
          </Card>

          {/* DBPR Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">DBPR Data</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  License Numbers
                </label>
                <p className="text-white text-sm">
                  {lead.dbpr_license_numbers?.length > 0
                    ? lead.dbpr_license_numbers.join(', ')
                    : '-'}
                </p>
              </div>
              <EditableField
                label="Rank Code"
                field="dbpr_rank_code"
                value={lead.dbpr_rank_code}
              />
              <EditableField
                label="Modifier Code"
                field="dbpr_modifier_code"
                value={lead.dbpr_modifier_code}
              />
            </div>
          </Card>

          {/* Business Details */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Business Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tier</label>
                <Badge className="bg-amber-900/50 text-amber-400">
                  {lead.tier}
                </Badge>
              </div>
              <EditableField
                label="Estimated Units"
                field="estimated_units"
                value={lead.estimated_units}
                type="number"
              />
              <EditableField
                label="License Count"
                field="license_count"
                value={lead.license_count}
                type="number"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  License Type
                </label>
                <p className="text-white">{lead.license_type}</p>
              </div>
              <EditableField
                label="Source"
                field="source"
                value={lead.source}
              />
              <EditableField
                label="Source Detail"
                field="source_detail"
                value={lead.source_detail}
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-6">
          {/* Key Dates */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Key Dates</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">First Contacted</p>
                <p className="text-white">
                  {formatDate(lead.date_first_contacted)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Last Contacted</p>
                <p className="text-white">
                  {formatDate(lead.date_last_contacted)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Demo Scheduled</p>
                <p className="text-white">
                  {formatDate(lead.date_demo_scheduled)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Converted</p>
                <p className="text-white">
                  {formatDate(lead.date_converted)}
                </p>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activities yet</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-800 last:border-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-amber-400">
                      {ACTIVITY_ICONS[activity.activity_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white break-words">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-gray-400 mt-1 break-words">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {formatRelativeDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
