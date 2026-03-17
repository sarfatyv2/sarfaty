import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    notFound();
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/roles/${id}`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
      next: { revalidate: 0 },
    },
  );

  if (!response.ok) {
    notFound();
  }

  const json = (await response.json()) as { data: RoleData };
  const role = json.data;

  return (
    <PermissionsEditor
      role={role}
      modules={MODULE_CATALOG}
      features={FEATURE_CATALOG}
    />
  );
}
