'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Zap, Clock, BarChart3, Plus, Power } from 'lucide-react';

interface SequenceStep {
  id: string;
  step_order: number;
  delay_hours: number;
  subject: string | null;
  body_template: string;
}

interface Sequence {
  id: string;
  name: string;
  trigger_type: string;
  is_active: boolean;
  email_sequence_steps: SequenceStep[];
}

interface StarterSequence {
  name: string;
  trigger_type: string;
  steps: { step_order: number; delay_hours: number; subject?: string; body_template: string }[];
}

const TRIGGER_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  post_checkout: { label: 'Post Check-out', emoji: '👋', description: 'Fires when guest checks out' },
  post_booking: { label: 'Post Booking', emoji: '📅', description: 'Fires when booking is confirmed' },
  anniversary: { label: 'Stay Anniversary', emoji: '🎂', description: 'Fires on 1-year anniversary' },
  winback_30d: { label: '30-Day Win-Back', emoji: '💌', description: 'Fires 30 days after checkout' },
  winback_60d: { label: '60-Day Win-Back', emoji: '📬', description: 'Fires 60 days after checkout' },
  winback_90d: { label: '90-Day Win-Back', emoji: '🔄', description: 'Fires 90 days after checkout' },
  seasonal: { label: 'Seasonal', emoji: '🌴', description: 'Manual seasonal campaigns' },
  manual: { label: 'Manual', emoji: '✏️', description: 'Manually triggered' },
};

function formatDelay(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

export default function MarketingPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [starters, setStarters] = useState<StarterSequence[]>([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/sequences');
    if (res.ok) {
      const data = await res.json();
      setSequences(data.sequences || []);
      setStarters(data.starters || []);
      setStats(data.stats || { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function activateStarter(starter: StarterSequence) {
    setCreating(starter.name);
    await fetch('/api/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(starter),
    });
    setCreating(null);
    fetchData();
  }

  async function toggleActive(id: string, currentlyActive: boolean) {
    await fetch('/api/sequences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentlyActive }),
    });
    fetchData();
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  const createdTriggers = new Set(sequences.map(s => s.trigger_type));
  const availableStarters = starters.filter(s => !createdTriggers.has(s.trigger_type));
  const openRate = stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0;
  const clickRate = stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Marketing</h1>
        <p className="text-sm text-gray-500 mt-1">Automated sequences that drive reviews and direct bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Emails Sent', value: stats.sent, icon: Mail, color: 'text-blue-400' },
          { label: 'Open Rate', value: `${openRate}%`, icon: BarChart3, color: 'text-green-400' },
          { label: 'Click Rate', value: `${clickRate}%`, icon: Zap, color: 'text-amber-400' },
          { label: 'Bounced', value: stats.bounced, icon: Mail, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <s.icon size={16} className={`${s.color} mb-2`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Available starter sequences */}
      {availableStarters.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activate a Sequence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableStarters.map(s => {
              const trigger = TRIGGER_LABELS[s.trigger_type] || TRIGGER_LABELS.manual;
              return (
                <button
                  key={s.trigger_type}
                  onClick={() => activateStarter(s)}
                  disabled={creating === s.name}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left hover:border-amber-400/30 transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{trigger.emoji}</span>
                    <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{s.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{trigger.description}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{s.steps.length} email{s.steps.length > 1 ? 's' : ''} in sequence</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active sequences */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Sequences</h2>
        {sequences.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
            <Mail size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No sequences configured</p>
            <p className="text-xs text-gray-600">Activate a pre-built sequence above to start automated emails</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map(seq => {
              const trigger = TRIGGER_LABELS[seq.trigger_type] || TRIGGER_LABELS.manual;
              const steps = seq.email_sequence_steps?.sort((a, b) => a.step_order - b.step_order) || [];
              return (
                <div key={seq.id} className={`rounded-xl border p-5 transition-colors ${seq.is_active ? 'border-gray-800 bg-gray-900/50' : 'border-gray-800/50 bg-gray-900/20 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{trigger.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-white">{seq.name}</h3>
                        <p className="text-[10px] text-gray-500">{trigger.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(seq.id, seq.is_active)}
                      className={`text-xs cursor-pointer ${seq.is_active ? 'border-green-600/30 text-green-400' : 'border-gray-700 text-gray-500'}`}
                    >
                      <Power size={12} className="mr-1" />
                      {seq.is_active ? 'Active' : 'Paused'}
                    </Button>
                  </div>

                  {/* Steps timeline */}
                  <div className="flex items-center gap-2 ml-8">
                    {steps.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2">
                          <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                            <Clock size={10} /> {formatDelay(step.delay_hours)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{step.subject || 'Email'}</p>
                        </div>
                        {i < steps.length - 1 && <span className="text-gray-700">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
