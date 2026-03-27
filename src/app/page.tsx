import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Check if they have an org
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();

  if (!org) redirect('/signup');

  // Redirect to properties (inside dashboard layout)
  redirect('/properties');
}
