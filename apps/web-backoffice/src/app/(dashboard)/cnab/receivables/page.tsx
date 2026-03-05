import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Button } from '@nexus/ui';
import { Upload } from 'lucide-react';
import { ReceivablesTable } from './_components/receivables-table';
import { ReceivableFilters } from './_components/receivable-filters';

export const metadata: Metadata = {
  title: 'Duplicatas | Sarfaty',
  description: 'Visualização de duplicatas e títulos de cobrança',
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

interface Receivable {
  id: string;
  documentNumber: string | null;
  draweeName: string | null;
  draweeDoc: string | null;
  draweeDocType: string | null;
  draweeAddress: string | null;
  draweeNeighborhood: string | null;
  draweeCity: string | null;
  draweeState: string | null;
  draweeZip: string | null;
  draweeEmail: string | null;
  dueDate: string | null;
  faceValue: string | null;
  status: string;
  ourNumber: string | null;
  portfolioCode: string | null;
  bankCode: string | null;
  branch: string | null;
  speciesCode: string | null;
  acceptance: string | null;
  instruction1: string | null;
  instruction2: string | null;
  interestPerDay: string | null;
  discountValue: string | null;
  discountDeadline: string | null;
  penaltyValue: string | null;
  iofValue: string | null;
  issueDate: string | null;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('401')) return 'Faça login para visualizar duplicatas.';
    if (err.message.includes('403')) return 'Você não tem permissão para acessar duplicatas.';
    if (err.message.includes('404')) return 'Endpoint não encontrado.';
    return err.message;
  }
  return 'Erro ao carregar duplicatas. Tente novamente.';
}

async function ReceivablesList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };
  if (searchParams.clientId) params.clientId = searchParams.clientId;
  if (searchParams.draweeId) params.draweeId = searchParams.draweeId;
  if (searchParams.cnabFileId) params.cnabFileId = searchParams.cnabFileId;
  if (searchParams.status) params.status = searchParams.status;
  if (searchParams.dueDateFrom) params.dueDateFrom = searchParams.dueDateFrom;
  if (searchParams.dueDateTo) params.dueDateTo = searchParams.dueDateTo;

  try {
    const result = await serverFetch<Receivable[]>('/cnab/receivables', params);

    const receivables = result?.data ?? [];
    const pagination = result?.pagination ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total} duplicata(s) encontrada(s)
          </p>
        </div>
        <ReceivablesTable receivables={receivables} pagination={pagination} />
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">Erro ao carregar duplicatas</p>
        <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(err)}</p>
      </div>
    );
  }
}

export default async function ReceivablesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Duplicatas</h1>
          <p className="text-sm text-muted-foreground">
            Títulos de cobrança importados via CNAB 400
          </p>
        </div>
        <Link href="/cnab/upload">
          <Button>
            <Upload size={16} />
            Upload CNAB
          </Button>
        </Link>
      </div>

      <ReceivableFilters />

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      }>
        <ReceivablesList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
