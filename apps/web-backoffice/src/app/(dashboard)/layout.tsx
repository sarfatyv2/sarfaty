import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard-shell';
import type { Role } from '@nexus/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as Role) ?? (user.user_metadata?.role as Role) ?? 'employee';
  const fullName = (profile?.full_name as string) ?? (user.user_metadata?.full_name as string) ?? user.email ?? '';

  return (
    <DashboardShell role={role} fullName={fullName} email={user.email ?? ''}>
      {children}
    </DashboardShell>
  );
}
