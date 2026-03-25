'use client';

import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CercValidationForm } from './cerc-validation-form';
import { CercResultsPanel } from './cerc-results-panel';
import type { CercResultado, CercValidationRecord } from './cerc.types';

const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 20;

export function CercValidatorClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [record, setRecord] = useState<CercValidationRecord | null>(null);
  const [resultados, setResultados] = useState<CercResultado[]>([]);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const fetchResultados = useCallback(async (validationId: string) => {
    try {
      const res = await api.get<CercResultado[]>(`/credit/cerc/validar/${validationId}/resultados`);
      setResultados(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResultados([]);
    }
  }, []);

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
        } else if (updated.status === 'ERROR') {
          setResultados([]);
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
    [clearPoll, fetchResultados],
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
        } else if (result.data.status === 'ERROR') {
          setResultados([]);
        }
      } catch {
        toast.error('Erro ao atualizar dados da validação.');
      }
    },
    [fetchResultados],
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
    [clearPoll, pollSync, fetchResultados],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full divide-y lg:divide-y-0 lg:divide-x">
      <div className="p-8 overflow-auto">
        <CercValidationForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      </div>
      <div className="p-8 overflow-auto bg-muted/20">
        <CercResultsPanel record={record} resultados={resultados} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
