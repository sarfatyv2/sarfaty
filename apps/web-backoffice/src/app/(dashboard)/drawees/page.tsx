import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Button } from '@nexus/ui';
import { Plus } from 'lucide-react';
import { DraweesTable } from './_components/drawees-table';
import { DraweeFilters } from './_components/drawee-filters';
import type { Drawee } from '@nexus/types';

export const metadata: Metadata = {
  title: 'Sacados | Sarfaty',
  description: 'Gestão de sacados',
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function DraweesList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };
  if (searchParams.search) params.search = searchParams.search;
  if (searchParams.status) params.status = searchParams.status;
  if (searchParams.personType) params.personType = searchParams.personType;

  const result = await serverFetch<Drawee[]>(
    '/drawees',
    params,
  );

  const drawees = result?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {result?.pagination?.total ?? 0} sacado(s) encontrado(s)
        </p>
      </div>
      <DraweesTable drawees={drawees} />
    </div>
  );
}

export default async function DraweesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sacados</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de sacados para operações de antecipação
          </p>
        </div>
        <Link href="/drawees/new">
          <Button>
            <Plus size={16} />
            Novo Sacado
          </Button>
        </Link>
      </div>

      <DraweeFilters />

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      }>
        <DraweesList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
