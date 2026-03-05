'use client';

import { useState, useCallback, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Button,
} from '@nexus/ui';
import { ChevronDown, ChevronRight, ChevronLeft, Briefcase, ExternalLink } from 'lucide-react';
import { OperationExpandedRow } from './operation-expanded-row';

interface CnabOperation {
  id: string;
  clientId: string;
  cnabFileId: string;
  clientName?: string | null;
  originalFilename?: string | null;
  status: string;
  totalSubmittedAmount: string;
  totalApprovedAmount: string;
  createdAt: string | null;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface OperationsTableProps {
  operations: CnabOperation[];
  pagination: Pagination;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'outline' },
  under_evaluation: { label: 'Em avaliação', variant: 'secondary' },
  evaluated: { label: 'Avaliada', variant: 'default' },
  active: { label: 'Ativa', variant: 'default' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatCurrency(value: string | null): string {
  if (!value || value === '0') return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const COL_COUNT = 8;

export function OperationsTable({ operations, pagination }: OperationsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleRow = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  if (operations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">Nenhuma operação encontrada</p>
        <p className="text-sm text-muted-foreground/70">Faça upload de um arquivo CNAB para criar operações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Cliente</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead className="text-right">Valor Submetido</TableHead>
              <TableHead className="text-right">Valor Aprovado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op) => {
              const isOpen = expanded.has(op.id);
              const statusConfig = STATUS_CONFIG[op.status] ?? { label: op.status, variant: 'outline' as const };
              return (
                <Fragment key={op.id}>
                  <TableRow
                    key={op.id}
                    className="cursor-pointer"
                    onClick={() => toggleRow(op.id)}
                  >
                    <TableCell className="w-10 px-2">
                      {isOpen ? (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronRight size={16} className="text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {op.clientName ?? op.clientId.slice(0, 8) + '...'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {op.originalFilename ?? op.cnabFileId.slice(0, 8) + '...'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(op.totalSubmittedAmount)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(op.totalApprovedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatDate(op.createdAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link href={`/cnab/operations/${op.id}`}>
                        <Button variant="ghost" size="sm" title="Ver página completa">
                          <ExternalLink size={14} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <OperationExpandedRow operationId={op.id} colSpan={COL_COUNT} />
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} operações)
          </p>
          <div className="flex gap-2">
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
