'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Eye } from 'lucide-react';

interface BrandConfig {
  primary_color: string;
  logo_url?: string;
  font?: string;
  welcome_message?: string;
}

export default function BrandPage() {
  const [config, setConfig] = useState<BrandConfig>({ primary_color: '#C9A84C' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(() => {
      // Load brand config from org — use the analytics endpoint which returns org data
      fetch('/api/brand').then(r => r.json()).then(d => {
        if (d.brand_config) setConfig(d.brand_config);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Brand Your Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Customize how your guest portal looks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div>
            <Label className="text-gray-400 text-xs">Brand Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={config.primary_color}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-700 cursor-pointer bg-transparent"
              />
              <Input
                value={config.primary_color}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white font-mono w-32"
                placeholder="#C9A84C"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-400 text-xs">Logo URL</Label>
            <Input
              value={config.logo_url || ''}
              onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
              placeholder="https://your-site.com/logo.png"
              className="bg-gray-800 border-gray-700 text-white mt-1"
            />
            <p className="text-[10px] text-gray-600 mt-1">PNG or SVG recommended. Will appear in the portal header.</p>
          </div>

          <div>
            <Label className="text-gray-400 text-xs">Welcome Message</Label>
            <Textarea
              value={config.welcome_message || ''}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              placeholder="Welcome! Complete your check-in to access WiFi and property info."
              className="bg-gray-800 border-gray-700 text-white mt-1"
              rows={3}
            />
            <p className="text-[10px] text-gray-600 mt-1">Shown on the check-in page before guests fill out the form.</p>
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-amber-400 text-gray-950 hover:bg-amber-300 cursor-pointer">
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Brand Settings'}
          </Button>
        </form>

        {/* Preview */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Eye size={14} /> Portal Preview
          </h2>
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-6 space-y-4">
            {/* Preview header */}
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold" style={{ color: config.primary_color }}>
                {config.logo_url ? (
                  <img src={config.logo_url} alt="Logo" className="h-8 object-contain" />
                ) : 'Your Organization'}
              </h3>
              <p className="text-[10px] text-gray-600">Property Name</p>
            </div>
            {/* Preview check-in */}
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🏠</div>
              <h4 className="text-lg font-bold text-white">Welcome!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[250px] mx-auto">
                {config.welcome_message || 'Complete your check-in to access WiFi and property info.'}
              </p>
            </div>
            {/* Preview button */}
            <button
              className="w-full py-3 rounded-lg text-sm font-semibold"
              style={{ background: config.primary_color, color: '#0a0a12' }}
            >
              Check In &amp; Get WiFi
            </button>
            {/* Preview WiFi card */}
            <div className="rounded-lg border-2 p-3" style={{ borderColor: `${config.primary_color}40`, background: `${config.primary_color}08` }}>
              <p className="text-[10px] font-semibold" style={{ color: config.primary_color }}>WiFi</p>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-500">Network: MyWiFi</span>
                <span className="text-[10px] text-gray-500">Pass: ****</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
