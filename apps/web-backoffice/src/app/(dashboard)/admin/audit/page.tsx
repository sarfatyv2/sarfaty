import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api-server';
import { Skeleton } from '@nexus/ui';
import { AuditLogTable } from './_components/audit-log-table';

export const metadata: Metadata = {
  title: 'Audit Trail | Sarfaty',
  description: 'Registro de ações sensíveis realizadas na plataforma',
};

interface AuditLogRow {
  id: string;
  correlationId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  httpMethod: string;
  path: string;
  payload: unknown;
  metadata: { ip?: string; userAgent?: string } | null;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function AuditLogList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
    sortOrder: 'desc',
  };

  if (searchParams.action) params.action = searchParams.action;
  if (searchParams.entityType) params.entityType = searchParams.entityType;
  if (searchParams.actorId) params.actorId = searchParams.actorId;
  if (searchParams.dateFrom) params.dateFrom = searchParams.dateFrom;
  if (searchParams.dateTo) params.dateTo = searchParams.dateTo;

  try {
    const res = await serverFetch<AuditLogRow[]>('/audit-logs', params);
    const logs = res.data ?? [];
    const pagination = res.pagination as PaginationMeta | undefined;

    return (
      <AuditLogTable
        logs={logs}
        pagination={pagination ?? { total: 0, page: 1, pageSize: 20, totalPages: 1 }}
      />
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar audit logs.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map(() => (
        <Skeleton key={crypto.randomUUID()} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default async function AuditTrailPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Registro completo de ações sensíveis realizadas na plataforma
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <AuditLogList searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
