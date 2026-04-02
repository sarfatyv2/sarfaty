import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { serverFetch } from '@/lib/api-server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';
import { Skeleton } from '@nexus/ui';
import { ROLES, type Role } from '@nexus/types';
import { CollaboratorsTable } from './_components/collaborators-table';
import { CollaboratorFilters } from './_components/collaborator-filters';
import { FlashSyncButton } from './_components/flash-sync-button';

export const metadata: Metadata = {
  title: 'Colaboradores | Sarfaty',
  description: 'Gerenciamento de colaboradores',
};

interface CollaboratorRow {
  id: string;
  fullName: string;
  corporateEmail: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  isActive: boolean;
  startDateOriginal: string | null;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function CollaboratorsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };

  if (searchParams.search) params.search = searchParams.search;
  if (searchParams.employmentType) params.employmentType = searchParams.employmentType;
  if (searchParams.isActive) params.isActive = searchParams.isActive;
  if (searchParams.department) params.department = searchParams.department;

  try {
    const response = await serverFetch<CollaboratorRow[]>('/people/collaborators', params);
    return <CollaboratorsTable collaborators={response.data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar colaboradores.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

const FLASH_SYNC_ROLES = new Set<Role>(['hr_admin', 'admin']);

export default async function CollaboratorsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let role: Role = 'employee';
  if (accessToken) {
    try {
      const payload = decodeJwt(accessToken);
      const roleClaim = payload.role;
      if (typeof roleClaim === 'string' && ROLES.includes(roleClaim as Role)) {
        role = roleClaim as Role;
      }
    } catch {
      role = 'employee';
    }
  }
  const canFlashSync = FLASH_SYNC_ROLES.has(role);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-normal">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        {canFlashSync && <FlashSyncButton />}
      </div>

      <Suspense fallback={null}>
        <CollaboratorFilters />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <CollaboratorsList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
