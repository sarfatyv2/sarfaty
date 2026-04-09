'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@nexus/ui';
import { ChevronLeft, ChevronRight, X, ScrollText } from 'lucide-react';

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

interface AuditLogTableProps {
  logs: AuditLogRow[];
  pagination: PaginationMeta;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  reimbursement: 'Reembolso',
  invoice: 'Nota Fiscal',
  collaborator: 'Colaborador',
  dependent: 'Dependente',
  user: 'Usuário',
  client: 'Cliente',
  document: 'Documento',
  course: 'Curso',
  module: 'Módulo',
  lesson: 'Aula',
  enrollment: 'Matrícula',
  committee: 'Comitê',
  meeting: 'Reunião',
  action_item: 'Item de Ação',
  wiki_article: 'Artigo Wiki',
  announcement: 'Comunicado',
  goal: 'Meta',
};

const HTTP_METHOD_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  POST: 'default',
  PATCH: 'secondary',
  DELETE: 'destructive',
  PUT: 'secondary',
};

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatShortId(id: string): string {
  return id.slice(0, 8);
}

export function AuditLogTable({ logs, pagination }: AuditLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push('?');
  }, [router]);

  const hasFilters =
    searchParams.has('action') ||
    searchParams.has('entityType') ||
    searchParams.has('actorId') ||
    searchParams.has('dateFrom') ||
    searchParams.has('dateTo');

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filtrar por ação (ex: reimbursement.approve)"
          defaultValue={searchParams.get('action') ?? ''}
          onChange={(e) => updateParam('action', e.target.value || undefined)}
          className="max-w-xs"
        />

        <Select
          value={searchParams.get('entityType') ?? ''}
          onValueChange={(value) => updateParam('entityType', value || undefined)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de entidade" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            value={searchParams.get('dateFrom') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              updateParam('dateFrom', value ? `${value}:00.000Z` : undefined);
            }}
            className="w-[200px]"
            aria-label="Data de início"
          />
          <span className="text-muted-foreground text-sm">até</span>
          <Input
            type="datetime-local"
            value={searchParams.get('dateTo') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              updateParam('dateTo', value ? `${value}:00.000Z` : undefined);
            }}
            className="w-[200px]"
            aria-label="Data de fim"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} />
            Limpar
          </Button>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? 'registro' : 'registros'} encontrados
      </p>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <ScrollText size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum registro encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Ajuste os filtros para encontrar registros de auditoria.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Data / Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead className="hidden md:table-cell">ID da Entidade</TableHead>
                <TableHead className="hidden lg:table-cell">Ator (ID)</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden xl:table-cell">IP</TableHead>
                <TableHead className="w-[70px]">Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-xs">
                    {ENTITY_TYPE_LABELS[log.entityType] ?? log.entityType}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                    {log.entityId ? formatShortId(log.entityId) : '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                    {formatShortId(log.actorId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.actorRole}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                    {log.metadata?.ip ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={HTTP_METHOD_VARIANT[log.httpMethod] ?? 'outline'} className="text-xs">
                      {log.httpMethod}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
