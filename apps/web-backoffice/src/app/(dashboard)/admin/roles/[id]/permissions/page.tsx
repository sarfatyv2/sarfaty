import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { MODULE_CATALOG, FEATURE_CATALOG } from '@nexus/types';
import { PermissionsEditor } from './_components/permissions-editor';

export const metadata: Metadata = {
  title: 'Permissões do Role | Sarfaty',
};

interface RoleData {
  id: string;
  key: string;
  label: string;
  homeRoute: string;
  isSystem: boolean;
  features: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RolePermissionsPage({ params }: Readonly<PageProps>) {
  const { id } = await params;

  let role: RoleData;
  try {
    const result = await serverFetch<RoleData>(`/roles/${id}`);
    role = result.data;
  } catch {
    notFound();
  }

  return (
    <PermissionsEditor
      role={role}
      modules={MODULE_CATALOG}
      features={FEATURE_CATALOG}
    />
  );
}
