import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Button } from '@nexus/ui';
import { Plus } from 'lucide-react';
import { ClientsTable } from './_components/clients-table';
import { ClientFilters } from './_components/client-filters';
import { PipelineSummary } from './_components/pipeline-summary';

export const metadata: Metadata = {
  title: 'Clientes | Sarfaty',
  description: 'Gestão de clientes comerciais',
};

interface ClientRow {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  status: string;
  requestedAmount: string | null;
  createdAt: string | null;
}

interface Segment {
  id: string;
  name: string;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function ClientsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };

  if (searchParams.search) params.search = searchParams.search;
  if (searchParams.status) params.status = searchParams.status;
  if (searchParams.segmentId) params.segmentId = searchParams.segmentId;

  try {
    const [clientsRes, segmentsRes] = await Promise.all([
      serverFetch<ClientRow[]>('/clients', params),
      serverFetch<Segment[]>('/segments'),
    ]);

    const segmentNames: Record<string, string> = {};
    (segmentsRes.data ?? []).forEach((seg) => {
      segmentNames[seg.id] = seg.name;
    });

    const clients = clientsRes.data ?? [];

    return (
      <div className="space-y-6">
        <PipelineSummary clients={clients} />
        <ClientsTable
          clients={clients}
          segmentNames={segmentNames}
        />
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar clientes.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map(() => (
        <Skeleton key={crypto.randomUUID()} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes e operações de crédito
          </p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus size={16} />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Suspense fallback={null}>
        <ClientFilters />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <ClientsList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
