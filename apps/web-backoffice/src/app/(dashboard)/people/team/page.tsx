import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api-server';
import { Skeleton } from '@nexus/ui';
import { CollaboratorsTable } from '../collaborators/_components/collaborators-table';

export const metadata: Metadata = {
  title: 'Meu Time | Sarfaty',
  description: 'Visualize os membros do seu time',
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

async function TeamList() {
  try {
    const response = await serverFetch<CollaboratorRow[]>('/people/collaborators', {
      pageSize: '50',
    });
    return <CollaboratorsTable collaborators={response.data} />;
  } catch {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Erro ao carregar time. Verifique se a API está rodando.
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

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-normal">Meu Time</h1>
        <p className="text-sm text-muted-foreground">
          Colaboradores sob sua gestão
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <TeamList />
      </Suspense>
    </div>
  );
}
