'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@nexus/ui';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface FaturamentoMonthlyRevenues {
  jan: number | null;
  feb: number | null;
  mar: number | null;
  apr: number | null;
  may: number | null;
  jun: number | null;
  jul: number | null;
  aug: number | null;
  sep: number | null;
  oct: number | null;
  nov: number | null;
  dec: number | null;
}

interface FaturamentoExtraction {
  id: string;
  clientId: string;
  cnpj: string;
  year: number;
  cpf: string | null;
  companyName: string | null;
  monthlyRevenues: FaturamentoMonthlyRevenues | null;
  totalAnnualRevenue: string | null;
  documentDescription: string | null;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
  extractionConfidence: 'high' | 'medium' | 'low' | null;
  ocrApplied: boolean;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientFaturamentoTabProps {
  clientId: string;
}

const STATUS_CONFIG: Record<
  FaturamentoExtraction['extractionStatus'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
  pending:      { label: 'Aguardando',  variant: 'secondary' },
  processing:   { label: 'Processando', variant: 'secondary' },
  completed:    { label: 'Concluído',   variant: 'default', className: 'bg-green-600 text-white border-transparent' },
  failed:       { label: 'Falhou',      variant: 'destructive' },
  needs_review: { label: 'Revisar',     variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
};

const CONFIDENCE_LABELS: Record<NonNullable<FaturamentoExtraction['extractionConfidence']>, string> = {
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
};

const MONTH_LABELS: Record<keyof FaturamentoMonthlyRevenues, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr',
  may: 'Mai', jun: 'Jun', jul: 'Jul', aug: 'Ago',
  sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez',
};

const MONTH_ORDER: (keyof FaturamentoMonthlyRevenues)[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

function formatCnpj(cnpj: string): string {
  if (cnpj.startsWith('doc:')) return `ID: ${cnpj.replace('doc:', '')}`;
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatCurrency(value: number | string | null): string {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ExtractionCard({
  extraction,
  clientId,
  onReprocess,
}: {
  extraction: FaturamentoExtraction;
  clientId: string;
  onReprocess: (extractionId: string) => void;
}) {
  const [reprocessing, setReprocessing] = useState(false);
  const statusCfg = STATUS_CONFIG[extraction.extractionStatus];

  async function handleReprocess() {
    setReprocessing(true);
    try {
      await api.post(`/clients/${clientId}/faturamento-extractions/${extraction.id}/reprocess`);
      toast.success('Reprocessamento agendado');
      onReprocess(extraction.id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao reprocessar';
      toast.error(message);
    } finally {
      setReprocessing(false);
    }
  }

  const presentMonths = extraction.monthlyRevenues
    ? MONTH_ORDER.filter((m) => extraction.monthlyRevenues![m] !== null).length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-muted-foreground" />
              <CardTitle className="text-base">
                {extraction.companyName ?? formatCnpj(extraction.cnpj)}
              </CardTitle>
              <Badge className="text-xs">{extraction.year}</Badge>
            </div>
            {extraction.companyName && (
              <p className="text-xs text-muted-foreground font-mono">{formatCnpj(extraction.cnpj)}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={statusCfg.variant}
              className={statusCfg.className}
            >
              {statusCfg.label}
            </Badge>
            {extraction.extractionConfidence && (
              <Badge variant="outline" className="text-xs">
                Confiança: {CONFIDENCE_LABELS[extraction.extractionConfidence]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {extraction.totalAnnualRevenue && (
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
            <span className="text-sm font-medium text-muted-foreground">Total Anual</span>
            <span className="text-base font-semibold">{formatCurrency(extraction.totalAnnualRevenue)}</span>
          </div>
        )}

        {extraction.monthlyRevenues && presentMonths > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Faturamento Mensal ({presentMonths}/12 meses)
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTH_ORDER.map((month) => {
                const value = extraction.monthlyRevenues![month];
                return (
                  <div
                    key={month}
                    className={`p-2 rounded text-center ${value === null ? 'bg-muted/20 opacity-40' : 'bg-muted/60'}`}
                  >
                    <p className="text-xs text-muted-foreground">{MONTH_LABELS[month]}</p>
                    <p className="text-xs font-medium mt-0.5">
                      {value === null ? '—' : formatCurrency(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {extraction.documentDescription && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
            {extraction.documentDescription}
          </p>
        )}

        {extraction.needsReview && (
          <div className="flex items-center gap-2 text-yellow-600 text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
            <span>Este registro requer revisão manual — verifique os dados extraídos.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Atualizado em {new Date(extraction.updatedAt).toLocaleDateString('pt-BR')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReprocess}
            disabled={reprocessing}
          >
            {reprocessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Reprocessar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const POLL_INTERVAL_MS = 5000;
const PROCESSING_STATUSES = new Set(['pending', 'processing']);

export function ClientFaturamentoTab({ clientId }: ClientFaturamentoTabProps) {
  const [extractions, setExtractions] = useState<FaturamentoExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExtractions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await api.get<FaturamentoExtraction[]>(
        `/clients/${clientId}/faturamento-extractions`,
      );
      setExtractions(res.data ?? []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar extrações de faturamento';
      setError(message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadExtractions();
  }, [loadExtractions]);

  // Auto-refresh while any extraction is still processing
  useEffect(() => {
    const hasProcessing = extractions.some((e) => PROCESSING_STATUSES.has(e.extractionStatus));
    if (!hasProcessing) return;

    const timer = setInterval(() => {
      loadExtractions(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [extractions, loadExtractions]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map(() => (
          <Skeleton key={crypto.randomUUID()} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => { void loadExtractions(); }}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (extractions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-2">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">
            Nenhum relatório de faturamento processado
          </p>
          <p className="text-xs text-muted-foreground">
            Faça o upload de um relatório de faturamento anual para iniciar a extração automática.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedExtractions = [...extractions].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {extractions.length} {extractions.length === 1 ? 'registro' : 'registros'} encontrado{extractions.length === 1 ? '' : 's'}
        </p>
        <Button variant="outline" size="sm" onClick={() => { void loadExtractions(); }}>
          <RefreshCw size={14} />
          Atualizar
        </Button>
      </div>

      {sortedExtractions.map((extraction) => (
        <ExtractionCard
          key={extraction.id}
          extraction={extraction}
          clientId={clientId}
          onReprocess={() => { void loadExtractions(true); }}
        />
      ))}
    </div>
  );
}
