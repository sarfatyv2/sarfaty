import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Button } from '@nexus/ui';
import { Upload } from 'lucide-react';
import { OperationsTable } from './_components/operations-table';
import { OperationFilters } from './_components/operation-filters';

export const metadata: Metadata = {
  title: 'Operações CNAB | Sarfaty',
  description: 'Operações de crédito derivadas de arquivos CNAB',
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

interface CnabOperation {
  id: string;
  clientId: string;
  cnabFileId: string;
  status: string;
  totalSubmittedAmount: string;
  totalApprovedAmount: string;
  createdAt: string | null;
  updatedAt: string | null;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('401')) return 'Faça login para visualizar operações.';
    if (err.message.includes('403')) return 'Você não tem permissão para acessar operações.';
    return err.message;
  }
  return 'Erro ao carregar operações. Tente novamente.';
}

async function OperationsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };
  if (searchParams.clientId) params.clientId = searchParams.clientId;
  if (searchParams.status) params.status = searchParams.status;

  try {
    const result = await serverFetch<CnabOperation[]>('/cnab/operations', params);

    const operations = result?.data ?? [];
    const pagination = result?.pagination ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 };

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {pagination.total} operação(ões) encontrada(s)
        </p>
        <OperationsTable operations={operations} pagination={pagination} />
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">Erro ao carregar operações</p>
        <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(err)}</p>
      </div>
    );
  }
}

export default async function OperationsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Operações</h1>
          <p className="text-sm text-muted-foreground">
            Avalie duplicatas e defina o crédito liberado por arquivo CNAB
          </p>
        </div>
        <Link href="/cnab/upload">
          <Button>
            <Upload size={16} />
            Upload CNAB
          </Button>
        </Link>
      </div>

      <OperationFilters />

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      }>
        <OperationsList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
