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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@nexus/ui';
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_CATEGORY_LABELS,
  formatCurrency,
  formatDate,
} from '@nexus/utils';
import { DollarSign, Eye, Download, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
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
  rejectionReason: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
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

interface ReceiptData {
  url: string;
  fileName: string | null;
  mimeType: string | null;
}

function ReceiptActions({ reimbursementId }: { reimbursementId: string }) {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ReceiptData | null>(null);

  async function fetchReceiptData(): Promise<ReceiptData | null> {
    setLoading(true);
    try {
      const response = await api.get<ReceiptData>(
        `/people/reimbursements/${reimbursementId}/receipt-url`,
      );
      return response.data;
    } catch {
      toast.error('Erro ao obter comprovante');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleView() {
    const data = await fetchReceiptData();
    if (data) {
      setPreviewData(data);
    }
  }

  async function handleDownload() {
    const data = await fetchReceiptData();
    if (data) {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName ?? 'comprovante';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  const isImage = previewData?.mimeType?.startsWith('image/');

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleView}
          disabled={loading}
          title="Visualizar comprovante"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDownload}
          disabled={loading}
          title="Baixar comprovante"
        >
          <Download size={14} />
        </Button>
      </div>

      <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewData?.fileName ?? 'Comprovante'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto">
            {previewData && isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewData.url}
                alt={previewData.fileName ?? 'Comprovante'}
                className="w-full h-auto rounded-md"
              />
            )}
            {previewData && !isImage && (
              <iframe
                src={previewData.url}
                title={previewData.fileName ?? 'Comprovante'}
                className="w-full h-[70vh] rounded-md border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ReimbursementsTable({
  reimbursements,
  collaboratorNames = {},
  onRefresh,
  mode,
  onCreateClick,
}: ReimbursementsTableProps) {
  const [payReimbursement, setPayReimbursement] = useState<Reimbursement | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const hasExpandableContent = (r: Reimbursement) =>
    r.status === 'rejected' && !!r.rejectionReason;

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
                  <TableHead className="w-10" />
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
                {reimbursements.map((r) => {
                  const expandable = hasExpandableContent(r);
                  const expanded = expandedRows.has(r.id);
                  const hasCollaboratorCol = mode === 'team' || mode === 'dp';
                  const hasActionsCol = mode === 'team' || mode === 'dp';
                  const colCount = 7 + (hasCollaboratorCol ? 1 : 0) + (hasActionsCol ? 1 : 0);

                  return (
                    <>
                      <TableRow key={r.id} className={expandable ? 'cursor-pointer' : undefined} onClick={expandable ? () => toggleRow(r.id) : undefined}>
                        <TableCell className="w-10 px-2">
                          {expandable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(r.id);
                              }}
                            >
                              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </Button>
                          )}
                        </TableCell>
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
                            <ReceiptActions reimbursementId={r.id} />
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayReimbursement(r);
                                  }}
                                >
                                  <DollarSign size={14} className="mr-1" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                      {expandable && expanded && (
                        <TableRow key={`${r.id}-detail`} className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={colCount} className="py-3 px-6">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-destructive">Motivo da rejeição</p>
                              <p className="text-sm text-muted-foreground">{r.rejectionReason}</p>
                              {r.rejectedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Rejeitado em {formatDate(r.rejectedAt)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
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
