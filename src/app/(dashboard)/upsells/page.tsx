'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingBag, Plus, DollarSign, Clock, Sparkles } from 'lucide-react';

interface UpsellTemplate {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_type: string;
  is_active: boolean;
  display_order: number;
}

interface StarterTemplate {
  category: string;
  name: string;
  description: string;
  price_cents: number;
  price_type: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  checkout: { label: 'Check-out', emoji: '🕐' },
  transport: { label: 'Transport', emoji: '🚗' },
  grocery: { label: 'Grocery', emoji: '🛒' },
  cleaning: { label: 'Cleaning', emoji: '🧹' },
  experience: { label: 'Experience', emoji: '🎯' },
  equipment: { label: 'Equipment', emoji: '🏖️' },
  chef: { label: 'Chef', emoji: '👨‍🍳' },
  custom: { label: 'Custom', emoji: '✨' },
};

function formatPrice(cents: number, type: string): string {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  const suffix = type === 'per_person' ? '/person' : type === 'per_night' ? '/night' : '';
  return `$${dollars}${suffix}`;
}

export default function UpsellsPage() {
  const [templates, setTemplates] = useState<UpsellTemplate[]>([]);
  const [starters, setStarters] = useState<StarterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [priceDollars, setPriceDollars] = useState('');
  const [priceType, setPriceType] = useState('fixed');

  const fetchTemplates = useCallback(async () => {
    const res = await fetch('/api/upsell-templates');
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates || []);
      setStarters(data.starters || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  function prefillFromStarter(starter: StarterTemplate) {
    setName(starter.name);
    setDescription(starter.description);
    setCategory(starter.category);
    setPriceDollars((starter.price_cents / 100).toString());
    setPriceType(starter.price_type);
    setDialogOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const priceCents = Math.round(parseFloat(priceDollars) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Enter a valid price');
      setSaving(false);
      return;
    }

    const res = await fetch('/api/upsell-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, category, price_cents: priceCents, price_type: priceType }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed');
      setSaving(false);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    setName(''); setDescription(''); setCategory('custom'); setPriceDollars(''); setPriceType('fixed');
    fetchTemplates();
  }

  async function toggleActive(id: string, currentlyActive: boolean) {
    await fetch('/api/upsell-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentlyActive }),
    });
    fetchTemplates();
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  // Filter starters that haven't been created yet
  const createdNames = new Set(templates.map(t => t.name));
  const availableStarters = starters.filter(s => !createdNames.has(s.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Upsell Services</h1>
          <p className="text-sm text-gray-500 mt-1">{templates.length} services configured</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
          <Plus size={16} className="mr-2" /> Create Custom
        </Button>
      </div>

      {/* Quick-add from starters */}
      {availableStarters.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" /> Quick Add — Pre-built Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableStarters.map((s) => {
              const cat = CATEGORY_LABELS[s.category] || CATEGORY_LABELS.custom;
              return (
                <button
                  key={s.name}
                  onClick={() => prefillFromStarter(s)}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left hover:border-amber-400/30 hover:bg-gray-900 transition-all cursor-pointer group"
                >
                  <div className="text-lg mb-2">{cat.emoji}</div>
                  <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatPrice(s.price_cents, s.price_type)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Create Upsell Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <div>
              <Label className="text-gray-400 text-xs">Service Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Late Checkout" className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included..." className="bg-gray-800 border-gray-700 text-white mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-gray-400 text-xs">Category</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm cursor-pointer">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Price ($) *</Label>
                <Input type="number" step="0.01" min="0.01" value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} required placeholder="35.00" className="bg-gray-800 border-gray-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Pricing</Label>
                <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm cursor-pointer">
                  <option value="fixed">Flat rate</option>
                  <option value="per_person">Per person</option>
                  <option value="per_night">Per night</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
              {saving ? 'Creating...' : 'Create Upsell'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active upsells */}
      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
          <ShoppingBag size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No upsells configured</p>
          <p className="text-xs text-gray-600">Use the quick-add templates above or create a custom one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const cat = CATEGORY_LABELS[t.category] || CATEGORY_LABELS.custom;
            return (
              <div key={t.id} className={`rounded-xl border p-5 transition-colors ${t.is_active ? 'border-gray-800 bg-gray-900/50' : 'border-gray-800/50 bg-gray-900/20 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-white">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-amber-400 font-medium flex items-center gap-1">
                          <DollarSign size={14} /> {formatPrice(t.price_cents, t.price_type)}
                        </span>
                        <Badge variant="outline" className="text-gray-500 border-gray-700 text-[10px]">{cat.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(t.id, t.is_active)}
                    className={`text-xs cursor-pointer ${t.is_active ? 'border-green-600/30 text-green-400' : 'border-gray-700 text-gray-500'}`}
                  >
                    {t.is_active ? 'Active' : 'Disabled'}
                  </Button>
                </div>
                {t.description && <p className="text-xs text-gray-500 mt-2 ml-10">{t.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
