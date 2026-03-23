import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { WikiLayout } from './_components/wiki-layout';
import type { Role } from '@nexus/types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';
import { serverFetch } from '@/lib/api-server';

export const metadata: Metadata = { title: 'Base de Conhecimento | Sarfaty' };

const EDITOR_ROLES = new Set<Role>(['admin', 'governance', 'hr_admin', 'people_manager', 'legal', 'compliance_officer']);

export default async function WikiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  let canEdit = false;
  if (token) {
    const me = await serverFetch<{ role: string }>('/auth/me').catch(() => null);
    if (me?.data?.role) {
      const role = me.data.role as Role;
      canEdit = EDITOR_ROLES.has(role);
    }
  }

  return <WikiLayout canEdit={canEdit} />;
}
