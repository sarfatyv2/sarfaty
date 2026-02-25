'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from '@nexus/ui';
import { AlertTriangle, ChevronDown, ChevronRight, FileText, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface IrpfConflict {
  field: string;
  receiptValue: unknown;
  declarationValue: unknown;
  resolvedValue: unknown;
  resolvedSource: 'receipt' | 'declaration';
  needsReview: boolean;
}

export interface IrpfExtraction {
  id: string;
  clientId: string;
  cpf: string;
  fullName: string | null;
  exerciseYear: number;
  calendarYear: number;
  declarationType: string | null;
  taxationOption: string | null;
  receiptNumber: string | null;
  deliveryTimestamp: string | null;
  totalTaxableIncome: string | null;
  totalExemptIncome: string | null;
  totalExclusiveIncome: string | null;
  totalDeductions: string | null;
  taxableBase: string | null;
  taxDue: string | null;
  taxPaid: string | null;
  taxRefund: string | null;
  taxBalance: string | null;
  totalAssetsCurrentYear: string | null;
  totalAssetsPreviousYear: string | null;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
  extractionConfidence: 'high' | 'medium' | 'low' | null;
  ocrApplied: boolean;
  needsReview: boolean;
  conflicts: IrpfConflict[] | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientIrpfTabProps {
  clientId: string;
  /** If provided, only show extractions matching this CPF */
  cpf?: string;
}

export const STATUS_CONFIG: Record<IrpfExtraction['extractionStatus'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  pending:      { label: 'Aguardando',  variant: 'secondary' },
  processing:   { label: 'Processando', variant: 'secondary' },
  completed:    { label: 'Concluído',   variant: 'default', className: 'bg-green-600 text-white border-transparent' },
  failed:       { label: 'Falhou',      variant: 'destructive' },
  needs_review: { label: 'Revisar',     variant: 'outline',    className: 'border-yellow-500 text-yellow-600' },
};

export const CONFIDENCE_LABELS: Record<NonNullable<IrpfExtraction['extractionConfidence']>, string> = {
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
};

const FIELD_LABELS: Record<string, string> = {
  totalTaxableIncome:    'Rendimento Tributável',
  totalExemptIncome:     'Rendimento Isento',
  totalExclusiveIncome:  'Rendimento Exclusivo',
  totalDeductions:       'Deduções',
  taxableBase:           'Base de Cálculo',
  taxDue:                'Imposto Devido',
  taxPaid:               'Imposto Pago',
  taxRefund:             'A Restituir',
  taxBalance:            'A Pagar',
  totalAssetsCurrentYear:'Patrimônio (ano atual)',
  totalAssetsPreviousYear:'Patrimônio (ano anterior)',
  receiptNumber:         'Nº do Recibo',
};

export function formatCurrencyIrpf(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDeclarationType(value: string | null): string {
  if (value === 'original') return 'Original';
  if (value === 'rectifying') return 'Retificadora';
  return '—';
}

function formatTaxationOption(value: string | null): string {
  if (value === 'deductions') return 'Deduções Legais';
  if (value === 'simplified') return 'Simplificada';
  return '—';
}

export function formatCpfIrpf(cpf: string): string {
  const d = cpf.replaceAll(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function formatUnknown(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return formatCurrencyIrpf(String(value));
  return String(value);
}

interface IrpfCardProps {
  extraction: IrpfExtraction;
  clientId: string;
  onReprocess: (extraction: IrpfExtraction) => Promise<void>;
  reprocessingId: string | null;
}

export function IrpfExtractionCard({ extraction, clientId, onReprocess, reprocessingId }: IrpfCardProps) {
  const [open, setOpen] = useState(false);
  const status = STATUS_CONFIG[extraction.extractionStatus];
  const conflictsNeedingReview = (extraction.conflicts ?? []).filter((c) => c.needsReview);
  const canReprocess = extraction.extractionStatus === 'failed' || extraction.extractionStatus === 'needs_review';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{extraction.fullName ?? 'Nome não extraído'}</p>
              <span className="text-xs font-semibold bg-primary/10 text-primary rounded px-2 py-0.5 shrink-0">
                IRPF {extraction.exerciseYear}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {formatCpfIrpf(extraction.cpf)} · Ano-Calendário {extraction.calendarYear}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant={status.variant} className={status.className}>{status.label}</Badge>
              {extraction.extractionConfidence && (
                <Badge variant="outline">
                  Confiança: {CONFIDENCE_LABELS[extraction.extractionConfidence]}
                </Badge>
              )}
              {extraction.ocrApplied && (
                <Badge variant="outline">OCR</Badge>
              )}
              {conflictsNeedingReview.length > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <AlertTriangle size={10} className="mr-1" />
                  {conflictsNeedingReview.length} conflito(s)
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canReprocess && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReprocess(extraction)}
                disabled={reprocessingId === extraction.id}
              >
                {reprocessingId === extraction.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Reprocessar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FinancialField label="Rendimento Tributável"  value={extraction.totalTaxableIncome} />
          <FinancialField label="Imposto Devido"         value={extraction.taxDue} />
          <FinancialField label="A Restituir"            value={extraction.taxRefund} />
          <FinancialField label="A Pagar"                value={extraction.taxBalance} />
          <FinancialField label="Patrimônio (atual)"     value={extraction.totalAssetsCurrentYear} />
          <FinancialField label="Deduções"               value={extraction.totalDeductions} />
          <FinancialField label="Base de Cálculo"        value={extraction.taxableBase} />
          <FinancialField label="Imposto Pago"           value={extraction.taxPaid} />
        </div>

        <div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronDown size={12} className="mr-1" /> : <ChevronRight size={12} className="mr-1" />}
            {open ? 'Ocultar detalhes' : 'Ver detalhes'}
          </Button>
          {open && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Tipo de Declaração</p>
                  <p>{formatDeclarationType(extraction.declarationType)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Tributação</p>
                  <p>{formatTaxationOption(extraction.taxationOption)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Nº do Recibo</p>
                  <p>{extraction.receiptNumber ?? '—'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Rendimento Isento</p>
                  <p>{formatCurrencyIrpf(extraction.totalExemptIncome)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Rendimento Exclusivo</p>
                  <p>{formatCurrencyIrpf(extraction.totalExclusiveIncome)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Patrimônio (anterior)</p>
                  <p>{formatCurrencyIrpf(extraction.totalAssetsPreviousYear)}</p>
                </div>
              </div>

              {(extraction.conflicts?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Conflitos entre Recibo e Declaração
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      O documento contém dados do <strong>recibo de entrega</strong> e da <strong>declaração</strong>. Os campos abaixo divergem entre as duas fontes.
                    </p>
                  </div>
                  <div className="divide-y rounded-md border text-xs">
                    {extraction.conflicts!.map((conflict) => {
                      const isReceiptNumberOnRectifying =
                        conflict.field === 'receiptNumber' &&
                        extraction.declarationType === 'rectifying';
                      const contextNote = isReceiptNumberOnRectifying
                        ? 'Esperado em retificadoras — a retificação gera um novo número de recibo.'
                        : null;

                      return (
                        <div key={conflict.field} className="px-3 py-2 space-y-1.5">
                          <div className="grid grid-cols-4 gap-2 items-start">
                            <span className="font-medium text-muted-foreground">
                              {FIELD_LABELS[conflict.field] ?? conflict.field}
                            </span>
                            <span className="text-muted-foreground">
                              <span className="block text-[10px] uppercase tracking-wide mb-0.5">Recibo</span>
                              {formatUnknown(conflict.receiptValue)}
                            </span>
                            <span className="text-muted-foreground">
                              <span className="block text-[10px] uppercase tracking-wide mb-0.5">Declaração</span>
                              {formatUnknown(conflict.declarationValue)}
                            </span>
                            <span>
                              <span className="block text-[10px] uppercase tracking-wide mb-0.5">Valor adotado</span>
                              {conflict.needsReview ? (
                                <span className="text-destructive font-medium">⚠ Requer revisão manual</span>
                              ) : (
                                <span className="text-muted-foreground">{formatUnknown(conflict.resolvedValue)}</span>
                              )}
                            </span>
                          </div>
                          {contextNote && (
                            <p className="text-[11px] text-muted-foreground bg-muted/50 rounded px-2 py-1">
                              ℹ️ {contextNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Atualizado em {new Date(extraction.updatedAt).toLocaleString('pt-BR')}
                {` · Cliente: ${clientId.slice(0, 8)}…`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{formatCurrencyIrpf(value)}</p>
    </div>
  );
}

const POLLING_INTERVAL_MS = 5_000;
const PROCESSING_STATUSES = new Set<IrpfExtraction['extractionStatus']>(['pending', 'processing']);

export function ClientIrpfTab({ clientId, cpf }: ClientIrpfTabProps) {
  const [extractions, setExtractions] = useState<IrpfExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const loadExtractions = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await api.get<IrpfExtraction[]>(`/clients/${clientId}/irpf-extractions`);
      const all = res.data ?? [];
      setExtractions(cpf ? all.filter((e) => e.cpf === cpf) : all);
    } catch {
      if (!silent) toast.error('Erro ao carregar extrações IRPF');
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [clientId, cpf]);

  useEffect(() => { loadExtractions(); }, [loadExtractions]);

  useEffect(() => {
    const hasProcessing = extractions.some((e) => PROCESSING_STATUSES.has(e.extractionStatus));
    if (!hasProcessing) return;

    const timer = setInterval(() => loadExtractions(true), POLLING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [extractions, loadExtractions]);

  async function handleReprocess(extraction: IrpfExtraction) {
    setReprocessingId(extraction.id);
    try {
      await api.post(`/clients/${clientId}/irpf-extractions/${extraction.id}/reprocess`);
      toast.success('Reprocessamento agendado. Aguarde alguns instantes.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao agendar reprocessamento');
    } finally {
      setReprocessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {['skeleton-0', 'skeleton-1'].map((key) => (
          <Skeleton key={key} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  const refreshButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => loadExtractions(true)}
      disabled={refreshing}
      className="h-7 px-2 text-xs text-muted-foreground"
    >
      <RefreshCw size={12} className={refreshing ? 'animate-spin mr-1' : 'mr-1'} />
      Atualizar
    </Button>
  );

  if (extractions.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">{refreshButton}</div>
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhuma extração IRPF encontrada{cpf ? ' para este sócio' : ' para este cliente'}.
          </p>
          <p className="text-xs text-muted-foreground">
            Os documentos serão processados automaticamente após o upload.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{refreshButton}</div>
      {extractions.map((extraction) => (
        <IrpfExtractionCard
          key={extraction.id}
          extraction={extraction}
          clientId={clientId}
          onReprocess={handleReprocess}
          reprocessingId={reprocessingId}
        />
      ))}
    </div>
  );
}
