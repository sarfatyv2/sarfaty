'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
} from '@nexus/ui';
import { ChevronDown, ChevronRight, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import { ReceivableStatusBadge } from './receivable-status-badge';
import { EvaluationStatusBadge } from './evaluation-status-badge';
import { ReceivableExpandedRow } from './receivable-expanded-row';

interface Receivable {
  id: string;
  clientName?: string | null;
  documentNumber: string | null;
  draweeName: string | null;
  evaluationStatus?: string;
  rejectionReason?: string | null;
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

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ReceivablesTableProps {
  receivables: Receivable[];
  pagination: Pagination;
}

function formatCurrency(value: string | null): string {
  if (!value || value === '0') return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatDoc(doc: string | null, type: string | null): string {
  if (!doc) return '';
  const d = doc.replaceAll(/\D/g, '');
  if (type === 'cnpj' && d.length === 14) {
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (type === 'cpf' && d.length === 11) {
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return doc;
}

const COL_COUNT = 9;

export function ReceivablesTable({ receivables, pagination }: ReceivablesTableProps) {
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

  const goToPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  if (receivables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Nenhuma duplicata encontrada</p>
        <p className="text-sm text-muted-foreground/70">Ajuste os filtros ou faça upload de um arquivo CNAB.</p>
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
              <TableHead>Documento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Sacado</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivables.map((r) => {
              const isOpen = expanded.has(r.id);
              return (
                <>
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => toggleRow(r.id)}
                  >
                    <TableCell className="w-10 px-2">
                      {isOpen ? (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronRight size={16} className="text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {r.documentNumber || '—'}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-primary">{r.clientName || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{r.draweeName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{formatDoc(r.draweeDoc, r.draweeDocType)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{formatCurrency(r.faceValue)}</TableCell>
                    <TableCell>
                      <ReceivableStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      {r.evaluationStatus ? (
                        <EvaluationStatusBadge status={r.evaluationStatus} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="w-10" />
                  </TableRow>
                  {isOpen && (
                    <ReceivableExpandedRow
                      key={`${r.id}-detail`}
                      data={r}
                      colSpan={COL_COUNT}
                    />
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} duplicatas)
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
