'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@nexus/ui';
import { EvaluationStatusBadge } from '../../../receivables/_components/evaluation-status-badge';
import { ReceivableEvaluateActions } from './receivable-evaluate-actions';

interface Operation {
  id: string;
  clientId: string;
  cnabFileId: string;
  status: string;
  totalSubmittedAmount: string;
  totalApprovedAmount: string;
  createdAt: string | null;
  updatedAt: string | null;
}

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

interface OperationDetailProps {
  operation: Operation;
  receivables: Receivable[];
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

export function OperationDetail({ operation, receivables }: OperationDetailProps) {
  const router = useRouter();

  const handleEvaluated = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Submetido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(operation.totalSubmittedAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Aprovado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(operation.totalApprovedAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Crédito Liberado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(operation.totalApprovedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Duplicatas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Aprove ou rejeite cada duplicata. O valor aprovado define o crédito da operação.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                    <TableCell className="font-medium">{r.documentNumber ?? '—'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{r.draweeName ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{formatDoc(r.draweeDoc, r.draweeDocType)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.faceValue)}</TableCell>
                    <TableCell>
                      <EvaluationStatusBadge status={r.evaluationStatus} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
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
          {receivables.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma duplicata nesta operação.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
