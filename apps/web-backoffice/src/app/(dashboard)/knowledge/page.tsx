import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { WikiLayout } from './_components/wiki-layout';
import type { Role } from '@nexus/types';

export const metadata: Metadata = { title: 'Base de Conhecimento | Sarfaty' };

const EDITOR_ROLES = new Set<Role>(['admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer']);

export default async function WikiPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canEdit = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = (profile?.role as Role) ?? 'employee';
    canEdit = EDITOR_ROLES.has(role);
  }

  return <WikiLayout canEdit={canEdit} />;
}
