import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RolesTable } from './_components/roles-table';

export const metadata: Metadata = {
  title: 'Roles & Permissões | Sarfaty',
  description: 'Gerencie os roles e permissões do sistema',
};

interface RoleRow {
  id: string;
  key: string;
  label: string;
  homeRoute: string;
  isSystem: boolean;
  isActive: boolean;
}

export default async function AdminRolesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  let roles: RoleRow[] = [];

  if (session?.access_token) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/roles?includeInactive=true`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          next: { revalidate: 0 },
        },
      );
      if (response.ok) {
        const json = (await response.json()) as { data: RoleRow[] };
        roles = json.data;
      }
    } catch {
      // show empty state
    }
  }

  return <RolesTable roles={roles} />;
}
