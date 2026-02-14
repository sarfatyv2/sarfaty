import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api-server';
import { Skeleton } from '@nexus/ui';
import { CollaboratorsTable } from './_components/collaborators-table';
import { CollaboratorFilters } from './_components/collaborator-filters';

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

export default async function CollaboratorsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os colaboradores da empresa
        </p>
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
