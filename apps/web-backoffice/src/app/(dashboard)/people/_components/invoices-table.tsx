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
import { PJ_INVOICE_STATUS_LABELS, formatCurrency } from '@nexus/utils';
import { Upload, DollarSign } from 'lucide-react';
import { UploadInvoiceDialog } from './upload-invoice-dialog';
import { ApproveRejectInvoiceButtons } from './approve-reject-invoice-buttons';
import { PayInvoiceDialog } from './pay-invoice-dialog';

interface PjInvoice {
  id: string;
  collaboratorId?: string;
  billingCompanyName?: string | null;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  invoiceAmount: string;
  invoiceNumber: string | null;
  [key: string]: unknown;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'pending_upload' || status === 'overdue') return 'destructive';
  if (status === 'pending_review' || status === 'pending_approval') return 'secondary';
  if (status === 'approved' || status === 'paid') return 'default';
  if (status === 'rejected') return 'destructive';
  return 'outline';
}

type InvoicesTableMode = 'me' | 'dp';

interface InvoicesTableProps {
  invoices: PjInvoice[];
  onRefresh: () => void;
  mode?: InvoicesTableMode;
  collaboratorNames?: Record<string, string>;
}

export function InvoicesTable({
  invoices,
  onRefresh,
  mode = 'me',
  collaboratorNames = {},
}: InvoicesTableProps) {
  const [uploadInvoice, setUploadInvoice] = useState<PjInvoice | null>(null);
  const [payInvoice, setPayInvoice] = useState<PjInvoice | null>(null);

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {mode === 'me'
              ? 'Nenhuma nota fiscal encontrada. Se você é PJ, as notas são geradas mensalmente pelo sistema.'
              : 'Nenhuma nota fiscal na fila'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const canUpload = (inv: PjInvoice) =>
    inv.status === 'pending_upload' || inv.status === 'overdue';
  const canApproveReject = (inv: PjInvoice) => inv.status === 'pending_review';
  const canPay = (inv: PjInvoice) =>
    inv.status === 'approved' ||
    inv.status === 'pending_approval' ||
    inv.status === 'payment_scheduled';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {mode === 'dp' && <TableHead>Colaborador</TableHead>}
                  {mode === 'dp' && <TableHead>Empresa destino</TableHead>}
                  {mode === 'me' && <TableHead>Tomador (NF)</TableHead>}
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Nº NF</TableHead>
                  <TableHead className="w-40">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const periodLabel = `${MONTH_NAMES[inv.referenceMonth - 1]} ${inv.referenceYear}`;
                  return (
                    <TableRow key={inv.id}>
                      {mode === 'dp' && (
                        <TableCell>
                          {inv.collaboratorId
                            ? collaboratorNames[inv.collaboratorId] ?? '—'
                            : '—'}
                        </TableCell>
                      )}
                      {mode === 'dp' && (
                        <TableCell className="max-w-[220px] truncate" title={inv.billingCompanyName ?? undefined}>
                          {inv.billingCompanyName ?? '—'}
                        </TableCell>
                      )}
                      {mode === 'me' && (
                        <TableCell className="max-w-[220px] truncate" title={inv.billingCompanyName ?? undefined}>
                          {inv.billingCompanyName ?? '—'}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{periodLabel}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(inv.status)}>
                          {PJ_INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(inv.invoiceAmount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {inv.invoiceNumber ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {mode === 'me' && canUpload(inv) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUploadInvoice(inv)}
                            >
                              <Upload size={14} className="mr-1" />
                              Enviar
                            </Button>
                          )}
                          {mode === 'dp' && canApproveReject(inv) && (
                            <ApproveRejectInvoiceButtons
                              invoiceId={inv.id}
                              onSuccess={onRefresh}
                            />
                          )}
                          {mode === 'dp' && canPay(inv) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPayInvoice(inv)}
                            >
                              <DollarSign size={14} className="mr-1" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {uploadInvoice && (
        <UploadInvoiceDialog
          invoice={uploadInvoice}
          open={!!uploadInvoice}
          onOpenChange={(open) => !open && setUploadInvoice(null)}
          onSuccess={onRefresh}
        />
      )}

      {payInvoice && (
        <PayInvoiceDialog
          invoice={payInvoice}
          open={!!payInvoice}
          onOpenChange={(open) => !open && setPayInvoice(null)}
          onSuccess={() => {
            setPayInvoice(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
