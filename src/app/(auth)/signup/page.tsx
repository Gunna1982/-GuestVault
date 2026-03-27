'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

export default function SignupPage() {
  const [step, setStep] = useState<'account' | 'org'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    if (step === 'account') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setStep('org');
      setLoading(false);
      return;
    }

    // Step 2: Create organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please sign in.');
      setLoading(false);
      return;
    }

    const slug = slugify(orgName) || `org-${Date.now()}`;
    const { error: orgError } = await supabase.from('organizations').insert({
      name: orgName,
      slug,
      owner_user_id: user.id,
    });

    if (orgError) {
      if (orgError.message.includes('duplicate')) {
        setError('That organization name is taken. Try another.');
      } else {
        setError(orgError.message);
      }
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-400 tracking-wide">GuestVault</h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'account' ? 'Create your account' : 'Name your organization'}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 'account' ? (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Organization / Company Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                placeholder="e.g., Sunset Villa Rentals"
              />
              <p className="text-xs text-gray-600 mt-1.5">
                Portal URL: guestvault.com/p/{slugify(orgName) || 'your-company'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-amber-400 text-gray-950 font-semibold text-sm hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : step === 'account' ? 'Create Account' : 'Launch Dashboard'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
