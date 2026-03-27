import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import MarketingHome from '@/components/MarketingHome';

export default async function RootPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_user_id', user.id)
      .single();

    if (!org) redirect('/signup');
    redirect('/properties');
  }

  return <MarketingHome />;
}
