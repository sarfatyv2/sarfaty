'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@nexus/ui';
import { Skeleton } from '@nexus/ui';
import { api } from '@/lib/api';
import { EvaluationStatusBadge } from '../../receivables/_components/evaluation-status-badge';
import { ReceivableEvaluateActions } from '../[id]/_components/receivable-evaluate-actions';
import Link from 'next/link';
import { Button } from '@nexus/ui';
import { ExternalLink } from 'lucide-react';

interface Receivable {
  id: string;
  documentNumber: string | null;
  draweeName: string | null;
  draweeDoc: string | null;
  draweeDocType: string | null;
  dueDate: string | null;
  faceValue: string | null;
  status: string;
  operationId: string | null;
  evaluationStatus: string;
  rejectionReason: string | null;
}

interface OperationExpandedRowProps {
  operationId: string;
  colSpan: number;
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

export function OperationExpandedRow({ operationId, colSpan }: OperationExpandedRowProps) {
  const router = useRouter();
  const [receivables, setReceivables] = useState<Receivable[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ operation: unknown; receivables: Receivable[] }>(`/cnab/operations/${operationId}`)
      .then((res) => {
        if (!cancelled && res?.data) {
          const data = res.data as { operation?: unknown; receivables?: Receivable[] };
          setReceivables(data?.receivables ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setReceivables([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [operationId]);

  const handleEvaluated = () => {
    router.refresh();
  };

  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="border-t bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Duplicatas desta operação</h4>
            <Link href={`/cnab/operations/${operationId}`}>
              <Button variant="outline" size="sm">
                <ExternalLink size={14} />
                Ver página completa
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : receivables && receivables.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Sacado</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Motivo Rejeição</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.documentNumber ?? '—'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{r.draweeName ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{formatDoc(r.draweeDoc, r.draweeDocType)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatCurrency(r.faceValue)}</TableCell>
                      <TableCell>
                        <EvaluationStatusBadge status={r.evaluationStatus} />
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                        {r.rejectionReason ?? '—'}
                      </TableCell>
                      <TableCell>
                        <ReceivableEvaluateActions
                          receivableId={r.id}
                          evaluationStatus={r.evaluationStatus}
                          onEvaluated={handleEvaluated}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma duplicata nesta operação.</p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
