import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get the user's organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_user_id', user.id)
    .single();

  if (!org) redirect('/signup?step=org');

  return <DashboardShell org={org} user={user}>{children}</DashboardShell>;
}
