'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw, ChevronRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Badge, Button } from '@nexus/ui';
import { CercValidationForm } from './cerc-validation-form';
import { CercResultsPanel } from './cerc-results-panel';
import type { CercResultado, CercValidationListItem, CercValidationRecord } from './cerc.types';

const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 20;

export function CercValidatorClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [record, setRecord] = useState<CercValidationRecord | null>(null);
  const [resultados, setResultados] = useState<CercResultado[]>([]);
  const [validacoes, setValidacoes] = useState<CercValidationListItem[]>([]);
  const [isLoadingValidacoes, setIsLoadingValidacoes] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const fetchValidacoes = useCallback(async () => {
    setIsLoadingValidacoes(true);
    try {
      const res = await api.get<CercValidationListItem[]>('/credit/cerc/validacoes');
      setValidacoes(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silently fail — list is non-critical
    } finally {
      setIsLoadingValidacoes(false);
    }
  }, []);

  useEffect(() => {
    void fetchValidacoes();
  }, [fetchValidacoes]);

  const fetchResultados = useCallback(async (validationId: string) => {
    try {
      const res = await api.get<CercResultado[]>(`/credit/cerc/validar/${validationId}/resultados`);
      setResultados(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResultados([]);
    }
  }, []);

  const handleSelectValidation = useCallback(
    async (id: string) => {
      clearPoll();
      setIsLoadingDetail(true);
      setResultados([]);
      try {
        const res = await api.get<CercValidationRecord>(`/credit/cerc/validar/${id}`);
        setRecord(res.data);
        if (res.data.status === 'PROCESSED') {
          await fetchResultados(id);
        }
      } catch {
        toast.error('Erro ao carregar detalhes da validação.');
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [clearPoll, fetchResultados],
  );

  const pollSync = useCallback(
    async (id: string) => {
      clearPoll();
      pollAttemptsRef.current += 1;

      try {
        const result = await api.post<CercValidationRecord>(
          `/credit/cerc/validar/${id}/sync`,
        );

        const updated = result.data;
        setRecord(updated);

        if (updated.status === 'PROCESSED') {
          await fetchResultados(id);
          void fetchValidacoes();
        } else if (updated.status === 'ERROR') {
          setResultados([]);
          void fetchValidacoes();
        }

        const isTerminal = updated.status === 'PROCESSED' || updated.status === 'ERROR';
        const exhausted = pollAttemptsRef.current >= POLL_MAX_ATTEMPTS;

        if (!isTerminal && !exhausted) {
          pollTimerRef.current = setTimeout(() => pollSync(id), POLL_INTERVAL_MS);
        }
      } catch {
        setRecord((prev) =>
          prev ? { ...prev, status: 'ERROR', errorMessage: 'Erro ao sincronizar com a CERC.' } : prev,
        );
        setResultados([]);
      }
    },
    [clearPoll, fetchResultados, fetchValidacoes],
  );

  const handleRefresh = useCallback(
    async (id: string) => {
      try {
        const result = await api.post<CercValidationRecord>(
          `/credit/cerc/validar/${id}/sync`,
        );
        setRecord(result.data);
        if (result.data.status === 'PROCESSED') {
          await fetchResultados(id);
          void fetchValidacoes();
        } else if (result.data.status === 'ERROR') {
          setResultados([]);
          void fetchValidacoes();
        }
      } catch {
        toast.error('Erro ao atualizar dados da validação.');
      }
    },
    [fetchResultados, fetchValidacoes],
  );

  const handleSubmit = useCallback(
    async (formData: {
      numeroDuplicata: string;
      chaveNfe: string;
      valor: number;
      vencimento: string;
      cnpjCedente: string;
      cnpjCpfPagador: string;
      tipoPagador: 'cpf' | 'cnpj';
      cnpjOriginador: string;
      referenciaExterna?: string;
    }) => {
      clearPoll();
      pollAttemptsRef.current = 0;
      setIsSubmitting(true);
      setRecord(null);
      setResultados([]);

      try {
        const result = await api.post<CercValidationRecord>(
          '/credit/cerc/validar',
          formData,
        );

        const created = result.data;
        setRecord(created);
        void fetchValidacoes();

        if (created.status === 'PROCESSED') {
          await fetchResultados(created.id);
        } else if (created.status !== 'ERROR') {
          pollTimerRef.current = setTimeout(() => pollSync(created.id), POLL_INTERVAL_MS);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao criar validação CERC.';
        toast.error(message);
        setRecord(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearPoll, pollSync, fetchResultados, fetchValidacoes],
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b divide-y lg:divide-y-0 lg:divide-x"
        style={{ minHeight: '520px' }}
      >
        <div className="p-8 overflow-auto">
          <CercValidationForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
        </div>
        <div className="p-8 overflow-auto bg-muted/20">
          <CercResultsPanel
            record={record}
            resultados={resultados}
            isLoadingDetail={isLoadingDetail}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      <CercValidacoesHistorico
        validacoes={validacoes}
        isLoading={isLoadingValidacoes}
        selectedId={record?.id ?? null}
        onSelect={handleSelectValidation}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Histórico de validações                                              */
/* ------------------------------------------------------------------ */

function formatDocument(numero: string, tipo: string): string {
  const digits = numero.replaceAll(/\D/g, '');
  if (tipo === 'cpf' && digits.length === 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (tipo === 'cnpj' && digits.length === 14)
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return numero;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDatetime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function HistoricoStatusIcon({ status }: Readonly<{ status: CercValidationListItem['status'] }>) {
  if (status === 'PROCESSED') return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />;
  if (status === 'ERROR') return <AlertTriangle size={13} className="text-destructive shrink-0" />;
  return <Loader2 size={13} className="animate-spin text-primary shrink-0" />;
}

function HistoricoStatusBadge({ status, statusProcessamento }: Readonly<{
  status: CercValidationListItem['status'];
  statusProcessamento: string | null;
}>) {
  if (status === 'PROCESSED') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium text-[11px] px-2">
        {statusProcessamento ?? 'Processado'}
      </Badge>
    );
  }
  if (status === 'ERROR') {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 font-medium text-[11px] px-2">
        Erro
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium text-[11px] px-2">
      Aguardando
    </Badge>
  );
}

interface CercValidacoesHistoricoProps {
  validacoes: CercValidationListItem[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function CercValidacoesHistorico({
  validacoes, isLoading, selectedId, onSelect,
}: Readonly<CercValidacoesHistoricoProps>) {
  const sorted = [...validacoes].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Histórico de Validações</h2>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {validacoes.length}{' '}
              {validacoes.length === 1 ? 'validação registrada' : 'validações registradas'}
            </p>
          )}
        </div>
        {isLoading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
      </div>

      {!isLoading && validacoes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <p className="text-sm text-muted-foreground">Nenhuma validação realizada ainda.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Nº Duplicata
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                  Valor
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Vencimento
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                  CNPJ Cedente
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Referência
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">
                  Solicitado em
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => onSelect(v.id)}
                  className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                    selectedId === v.id ? 'bg-primary/5 ring-inset ring-1 ring-primary/20' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <HistoricoStatusIcon status={v.status} />
                      {v.numeroDuplicata}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {formatCurrency(v.valor)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(v.vencimento)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {formatDocument(v.cnpjCedente, 'cnpj')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {v.referenciaExterna ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <HistoricoStatusBadge
                      status={v.status}
                      statusProcessamento={v.statusProcessamento}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                    {formatDatetime(v.requestedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronRight size={13} className="text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
