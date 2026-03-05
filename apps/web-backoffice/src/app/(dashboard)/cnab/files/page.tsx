import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Button } from '@nexus/ui';
import { Upload } from 'lucide-react';
import { CnabFilesTable } from './_components/cnab-files-table';

export const metadata: Metadata = {
  title: 'Arquivos CNAB | Sarfaty',
  description: 'Listagem de arquivos CNAB importados',
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

interface CnabFile {
  id: string;
  originalFilename: string;
  bankCode: string;
  bankName: string | null;
  cedentName: string | null;
  remittanceDate: string | null;
  totalRecords: number | null;
  totalAmount: string | null;
  status: string;
  createdAt: string | null;
}

async function FilesList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
  };
  if (searchParams.clientId) params.clientId = searchParams.clientId;
  if (searchParams.status) params.status = searchParams.status;

  const result = await serverFetch<CnabFile[]>('/cnab/files', params);

  const files = result?.data ?? [];
  const pagination = result?.pagination ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {pagination.total} arquivo(s) encontrado(s)
      </p>
      <CnabFilesTable files={files} pagination={pagination} />
    </div>
  );
}

export default async function CnabFilesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Arquivos CNAB</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de arquivos CNAB 400 importados
          </p>
        </div>
        <Link href="/cnab/upload">
          <Button>
            <Upload size={16} />
            Upload CNAB
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      }>
        <FilesList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
