'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nexus/ui';
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_CATEGORY_LABELS,
  formatCurrency,
  formatDate,
} from '@nexus/utils';
import { Check, X, DollarSign } from 'lucide-react';
import { PayReimbursementDialog } from './pay-reimbursement-dialog';
import { ApproveRejectButtons } from './approve-reject-buttons';

interface Reimbursement {
  id: string;
  collaboratorId: string;
  title: string;
  description: string | null;
  category: string;
  amount: string;
  expenseDate: string;
  status: string;
  receiptFileName: string | null;
  receiptPath: string | null;
  approvedBy: string | null;
  [key: string]: unknown;
}

type ReimbursementsTableMode = 'mine' | 'team' | 'dp';

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'pending') return 'secondary';
  if (status === 'approved' || status === 'processing' || status === 'paid')
    return 'default';
  if (status === 'rejected') return 'destructive';
  return 'outline';
}

interface ReimbursementsTableProps {
  reimbursements: Reimbursement[];
  collaboratorNames?: Record<string, string>;
  onRefresh: () => void;
  mode: ReimbursementsTableMode;
  onCreateClick?: () => void;
}

export function ReimbursementsTable({
  reimbursements,
  collaboratorNames = {},
  onRefresh,
  mode,
  onCreateClick,
}: ReimbursementsTableProps) {
  const [payReimbursement, setPayReimbursement] = useState<Reimbursement | null>(null);

  if (reimbursements.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reembolsos</CardTitle>
          {mode === 'mine' && onCreateClick && (
            <Button size="sm" onClick={onCreateClick}>
              Novo Reembolso
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum reembolso encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  const canApproveReject = (r: Reimbursement) =>
    mode !== 'mine' && r.status === 'pending';
  const canPay = (r: Reimbursement) =>
    mode === 'dp' && (r.status === 'approved' || r.status === 'processing');

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reembolsos</CardTitle>
          {mode === 'mine' && onCreateClick && (
            <Button size="sm" onClick={onCreateClick}>
              Novo Reembolso
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {mode !== 'mine' && <TableHead>Colaborador</TableHead>}
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comprovante</TableHead>
                  {(mode === 'team' || mode === 'dp') && <TableHead className="w-40">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.map((r) => (
                  <TableRow key={r.id}>
                    {mode !== 'mine' && (
                      <TableCell>
                        {collaboratorNames[r.collaboratorId] ?? '—'}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>
                      {REIMBURSEMENT_CATEGORY_LABELS[r.category] ?? r.category}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(r.amount))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.expenseDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(r.status)}>
                        {REIMBURSEMENT_STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {r.receiptFileName ? (
                        <span title={r.receiptFileName}>
                          Comprovante anexado
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    {(mode === 'team' || mode === 'dp') && (
                      <TableCell>
                        <div className="flex gap-2">
                          {canApproveReject(r) && (
                            <ApproveRejectButtons
                              reimbursementId={r.id}
                              onSuccess={onRefresh}
                            />
                          )}
                          {canPay(r) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPayReimbursement(r)}
                            >
                              <DollarSign size={14} className="mr-1" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {payReimbursement && (
        <PayReimbursementDialog
          reimbursement={payReimbursement}
          open={!!payReimbursement}
          onOpenChange={(open) => !open && setPayReimbursement(null)}
          onSuccess={() => {
            setPayReimbursement(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
