import type { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
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
  let roles: RoleRow[] = [];

  try {
    const result = await serverFetch<RoleRow[]>('/roles', { includeInactive: true });
    roles = Array.isArray(result.data) ? result.data : [];
  } catch {
    roles = [];
  }

  return <RolesTable roles={roles} />;
}
