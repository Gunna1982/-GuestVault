'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Plus, Wifi, MapPin, Edit, Trash2 } from 'lucide-react';
import type { Property } from '@/types/database';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [wifiName, setWifiName] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [checkoutTime, setCheckoutTime] = useState('11:00 AM');
  const [checkInInstructions, setCheckInInstructions] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [parking, setParking] = useState('');

  const fetchProperties = useCallback(async () => {
    const res = await fetch('/api/properties');
    if (res.ok) {
      const data = await res.json();
      setProperties(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  function resetForm() {
    setName(''); setDescription(''); setStreet(''); setCity(''); setState(''); setZip('');
    setWifiName(''); setWifiPass(''); setCheckoutTime('11:00 AM');
    setCheckInInstructions(''); setHouseRules(''); setParking('');
    setEditingId(null); setError('');
  }

  function openEdit(p: Property) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || '');
    setStreet(p.address?.street || '');
    setCity(p.address?.city || '');
    setState(p.address?.state || '');
    setZip(p.address?.zip || '');
    setWifiName(p.property_info?.wifi_name || '');
    setWifiPass(p.property_info?.wifi_pass || '');
    setCheckoutTime(p.property_info?.checkout_time || '11:00 AM');
    setCheckInInstructions(p.property_info?.check_in_instructions || '');
    setHouseRules(p.property_info?.house_rules || '');
    setParking(p.property_info?.parking || '');
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const body = {
      name,
      description: description || null,
      address: (street || city || state || zip) ? { street, city, state, zip } : null,
      property_info: {
        wifi_name: wifiName || null,
        wifi_pass: wifiPass || null,
        checkout_time: checkoutTime || null,
        check_in_instructions: checkInInstructions || null,
        house_rules: houseRules || null,
        parking: parking || null,
      },
    };

    const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      setSaving(false);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchProperties();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this property? This can be undone.')) return;
    await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    fetchProperties();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
          <Plus size={16} className="mr-2" /> Add Property
        </Button>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Property' : 'Add Property'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h3>
                <div>
                  <Label className="text-gray-400 text-xs">Property Name *</Label>
                  <Input
                    value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="e.g., Sunset Villa"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                  {name && <p className="text-xs text-gray-600 mt-1">Slug: {slugify(name)}</p>}
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Description</Label>
                  <Textarea
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of the property"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    rows={3}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</h3>
                <div>
                  <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="bg-gray-800 border-gray-700 text-white" />
                  <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="bg-gray-800 border-gray-700 text-white" />
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>

              {/* Property Info (the carrot) */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Wifi size={14} /> Guest Info (shown after check-in)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-400 text-xs">WiFi Network</Label>
                    <Input value={wifiName} onChange={(e) => setWifiName(e.target.value)} placeholder="Network name" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">WiFi Password</Label>
                    <Input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="Password" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Check-out Time</Label>
                  <Input value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Check-in Instructions</Label>
                  <Textarea value={checkInInstructions} onChange={(e) => setCheckInInstructions(e.target.value)} placeholder="How to access the property..." className="bg-gray-800 border-gray-700 text-white mt-1" rows={3} />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">House Rules</Label>
                  <Textarea value={houseRules} onChange={(e) => setHouseRules(e.target.value)} placeholder="No smoking, quiet hours, etc." className="bg-gray-800 border-gray-700 text-white mt-1" rows={3} />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Parking Instructions</Label>
                  <Input value={parking} onChange={(e) => setParking(e.target.value)} placeholder="Parking details" className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
                {saving ? 'Saving...' : editingId ? 'Update Property' : 'Create Property'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property Cards */}
      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center">
          <Building2 size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No properties yet</p>
          <p className="text-xs text-gray-600">Add your first rental property to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  {p.address?.city && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {p.address.city}{p.address.state ? `, ${p.address.state}` : ''}
                    </p>
                  )}
                </div>
                <Badge variant={p.is_active ? 'default' : 'secondary'} className={p.is_active ? 'bg-green-500/15 text-green-400 border-green-500/30' : ''}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {p.description && (
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{p.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                {p.property_info?.wifi_name && (
                  <span className="flex items-center gap-1"><Wifi size={12} /> WiFi set</span>
                )}
                {p.property_info?.house_rules && <span>Rules set</span>}
                {p.property_info?.checkout_time && <span>{p.property_info.checkout_time}</span>}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="text-xs border-gray-700 text-gray-400 hover:text-white cursor-pointer">
                  <Edit size={14} className="mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="text-xs border-gray-700 text-red-400 hover:text-red-300 cursor-pointer">
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
