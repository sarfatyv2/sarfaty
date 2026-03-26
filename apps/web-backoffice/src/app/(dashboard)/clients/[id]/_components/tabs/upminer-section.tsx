'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Skeleton } from '@nexus/ui';
import {
  Layers,
  Loader2,
  RefreshCw,
  History,
  AlertTriangle,
  Database,
  Building2,
  Scale,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';
import { ExpandableHeader } from './client-credit-analysis-tab';

import type {
  UpminerResultDto,
  UpminerDossiersDataPayload,
  UpminerParallelData,
  UpminerParallelDataResponse,
  UpminerPdfRequestResponse,
  UpminerPdfDownloadResponse,
  UpminerParallelStatus,
} from './upminer.types';
import { formatDate, POLL_INTERVAL_MS, MAX_SYNC_POLL_ATTEMPTS, PDF_POLL_INTERVAL_MS, MAX_PDF_POLL_ATTEMPTS } from './upminer.utils';
import { StatusBadge, upminerStatusBadge } from './upminer.ui';
import { EmpresaPjCard } from './upminer.empresa-pj-card';
import { ProcessosJudiciaisCard } from './upminer.processos-card';
import { DossierView } from './upminer.dossier-view';

// ─── Parallel Data Section ────────────────────────────────────────────────────

interface ParallelDataSectionProps {
  parallelStatus: UpminerParallelStatus | null;
  parallelData: UpminerParallelData | null;
  parallelInFlight: boolean;
  syncingParallel: boolean;
  onSync: () => void;
}

function ParallelDataSection({
  parallelStatus,
  parallelData,
  parallelInFlight,
  syncingParallel,
  onSync,
}: Readonly<ParallelDataSectionProps>) {
  const isLoading = parallelInFlight || syncingParallel;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Fontes Adicionais</span>
          <span className="text-xs text-muted-foreground">
            — Empresa PJ Enriquecida e Processos Judiciais
          </span>
        </div>
        {parallelStatus === 'PROCESSED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={isLoading}
            className="h-7 text-xs text-muted-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCcw className="h-3 w-3 mr-1" />
            )}
            Atualizar
          </Button>
        )}
      </div>

      {/* Not yet requested */}
      {parallelStatus === null && !isLoading && (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted/50 p-3">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Dados adicionais não consultados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Busque dados enriquecidos de Empresa PJ e Processos Judiciais via upMiner.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onSync} disabled={isLoading}>
            <Database className="h-3.5 w-3.5 mr-1.5" />
            Buscar Fontes Adicionais
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border bg-muted/20 p-6 flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando Empresa PJ e Processos Judiciais…</p>
        </div>
      )}

      {/* Error */}
      {parallelStatus === 'ERROR' && !isLoading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Erro ao buscar fontes adicionais</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tente novamente ou verifique se o cliente possui dados disponíveis no upMiner.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onSync} className="shrink-0">
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Loaded: Empresa PJ */}
      {!isLoading && parallelData?.empresaPj && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Empresa PJ Enriquecida
            </span>
          </div>
          <EmpresaPjCard empresa={parallelData.empresaPj} />
        </div>
      )}

      {/* Loaded: Processos Judiciais */}
      {!isLoading && parallelData?.processos && parallelData.processos.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <Scale className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Processos Judiciais
            </span>
          </div>
          <ProcessosJudiciaisCard processos={parallelData.processos} />
        </div>
      )}

      {/* Processed but no data */}
      {!isLoading && parallelStatus === 'PROCESSED' && !parallelData?.empresaPj && (!parallelData?.processos || parallelData.processos.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-3">
          Nenhum dado adicional encontrado para este cliente.
        </p>
      )}
    </div>
  );
}

interface UpminerSectionProps {
  clientId: string;
}

export function UpminerSection({ clientId }: Readonly<UpminerSectionProps>) {
  const basePath = `/clients/${clientId}/credit-analysis`;

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<UpminerResultDto | null>(null);
  const [dossiersData, setDossiersData] = useState<UpminerDossiersDataPayload | null>(null);
  const [parallelData, setParallelData] = useState<UpminerParallelData | null>(null);
  const [history, setHistory] = useState<UpminerResultDto[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [requestingBatch, setRequestingBatch] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingParallel, setSyncingParallel] = useState(false);
  const [pdfLoadingDossierId, setPdfLoadingDossierId] = useState<number | null>(null);

  const pollAttemptsRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  }, []);

  const loadDossiersData = useCallback(async () => {
    try {
      const res = await api.get<UpminerDossiersDataPayload | null>(`${basePath}/upminer/dossiers-data`);
      setDossiersData(res.data?.dossiers?.length ? res.data : (res.data ?? { dossiers: [] }));
    } catch {
      setDossiersData(null);
    }
  }, [basePath]);

  const loadParallelData = useCallback(async () => {
    try {
      const res = await api.get<UpminerParallelDataResponse>(`${basePath}/upminer/parallel-data`);
      if (res.data?.data) {
        setParallelData(res.data.data);
      }
    } catch {
      // parallel data is non-critical — silently ignore
    }
  }, [basePath]);

  const loadResult = useCallback(async () => {
    try {
      const res = await api.get<UpminerResultDto | null>(`${basePath}/upminer`);
      setResult(res.data ?? null);
      return res.data ?? null;
    } catch {
      setResult(null);
      return null;
    }
  }, [basePath]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await api.post<UpminerResultDto | null>(`${basePath}/upminer/sync`);
      const next = res.data ?? null;
      setResult(next);
      return next;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao sincronizar upMiner';
      toast.error(message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [basePath]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const r = await loadResult();
      if (cancelled) return;
      if (r?.status === 'PROCESSED') {
        await loadDossiersData();
        if (r.parallelStatus === 'PROCESSED') {
          await loadParallelData();
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId, loadResult, loadDossiersData, loadParallelData]);

  const parallelInFlight =
    result?.status === 'PROCESSED' &&
    (result.parallelStatus === 'PENDING' || result.parallelStatus === 'PROCESSING');

  const batchPending =
    result &&
    (result.status === 'QUEUED' || result.status === 'PROCESSING' || result.status === 'PENDING');

  const shouldPoll = Boolean(batchPending || parallelInFlight);

  useEffect(() => {
    if (!shouldPoll) {
      stopPolling();
      return;
    }

    const tick = async () => {
      const next = await runSync();
      if (!next) return;

      const batchDone = next.status === 'PROCESSED' || next.status === 'ERROR';
      const parallelDone =
        next.parallelStatus === null ||
        next.parallelStatus === 'PROCESSED' ||
        next.parallelStatus === 'ERROR';

      if (next.status === 'PROCESSED' && !dossiersData) {
        void loadDossiersData();
      }

      if (next.parallelStatus === 'PROCESSED' && !parallelData) {
        void loadParallelData();
      }

      if (batchDone && parallelDone) {
        stopPolling();
        if (next.status === 'PROCESSED') toast.success('Consulta upMiner concluída.');
        if (next.status === 'ERROR') toast.error(next.errorMessage || 'Erro no processamento upMiner.');
      }
    };

    void tick();

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current > MAX_SYNC_POLL_ATTEMPTS) {
        stopPolling();
        toast.warning('O upMiner ainda está processando. Clique em "Sincronizar" para verificar quando terminar.');
        return;
      }
      await tick();
    }, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [shouldPoll, result?.id]);

  const handleRequestBatch = async () => {
    setRequestingBatch(true);
    try {
      const res = await api.post<UpminerResultDto>(`${basePath}/upminer`, {});
      setResult(res.data);
      pollAttemptsRef.current = 0;
      toast.success('Batch upMiner solicitado.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar batch upMiner';
      toast.error(message);
    } finally {
      setRequestingBatch(false);
    }
  };

  const handleManualSync = async () => {
    const next = await runSync();
    if (!next) return;
    if (next.status === 'PROCESSED') {
      await loadDossiersData();
      if (next.parallelStatus === 'PROCESSED') {
        await loadParallelData();
        toast.success('Sincronizado.');
      } else if (next.parallelStatus === 'PENDING' || next.parallelStatus === 'PROCESSING') {
        toast.info('Dossiê sincronizado. Fontes adicionais ainda em processamento.');
      } else {
        toast.success('Sincronizado.');
      }
    } else if (next.status === 'ERROR') {
      toast.error(next.errorMessage || 'Erro no batch upMiner.');
    } else {
      toast.info('Batch ainda em processamento no upMiner.');
    }
  };

  const handleSyncParallel = async () => {
    setSyncingParallel(true);
    try {
      const res = await api.post<{ parallelStatus: string | null }>(`${basePath}/upminer/sync-parallel`);
      const { parallelStatus } = res.data ?? {};
      if (parallelStatus === 'PROCESSED') {
        await loadParallelData();
        await loadResult();
        toast.success('Empresa PJ e Processos carregados.');
      } else if (parallelStatus === 'ERROR') {
        toast.error('Erro ao buscar Empresa PJ / Processos Judiciais.');
      } else {
        toast.info('Processando. Aguarde alguns segundos e tente novamente.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao buscar fontes adicionais';
      toast.error(message);
    } finally {
      setSyncingParallel(false);
    }
  };

  const loadHistory = async () => {
    if (history !== null) return;
    try {
      const res = await api.get<UpminerResultDto[]>(`${basePath}/upminer/history`);
      setHistory(res.data ?? []);
    } catch {
      setHistory([]);
    }
  };

  const handleToggleHistory = () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next) void loadHistory();
  };

  const requestPdf = async (apiDossierId: number) => {
    setPdfLoadingDossierId(apiDossierId);
    try {
      const postRes = await api.post<UpminerPdfRequestResponse>(
        `${basePath}/upminer/dossier/${apiDossierId}/pdf`,
        {},
      );
      const processId = postRes.data?.id_processo;
      if (!processId) { toast.error('Resposta inválida ao solicitar PDF.'); return; }

      for (let attempt = 0; attempt < MAX_PDF_POLL_ATTEMPTS; attempt += 1) {
        await new Promise((r) => setTimeout(r, PDF_POLL_INTERVAL_MS));
        const statusRes = await api.get<UpminerPdfDownloadResponse>(
          `${basePath}/upminer/dossier/${apiDossierId}/pdf/${processId}`,
        );
        const payload = statusRes.data;
        if (payload?.url) { window.open(payload.url, '_blank', 'noopener,noreferrer'); toast.success('PDF disponível.'); return; }
        const st = payload?.status?.toLowerCase() ?? '';
        if (st.includes('error') || st.includes('fail')) { toast.error('Falha ao gerar PDF no upMiner.'); return; }
      }
      toast.warning('Tempo limite ao aguardar o PDF.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao solicitar PDF');
    } finally {
      setPdfLoadingDossierId(null);
    }
  };

  const statusCfg = result ? upminerStatusBadge(result.status) : null;

  return (
    <Card className="overflow-hidden">
      <ExpandableHeader
        icon={<Layers size={15} className="text-primary" />}
        title="upMiner"
        subtitle="Dossiês e fontes"
        badge={statusCfg ? <StatusBadge value={statusCfg.label} type={statusCfg.type} /> : undefined}
        isOpen={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      <ExpandableContent isOpen={expanded}>
        {loading ? (
          <div className="px-8 pb-8 space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando dados upMiner…
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : (
        <div className="px-8 pb-8 space-y-6">
          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground space-y-0.5">
              {result?.requestedAt && <p>Solicitado em {formatDate(result.requestedAt)}</p>}
              {result?.batchId != null && <p>Batch ID: {result.batchId}</p>}
              {result?.searchProfileId != null && <p>Perfil: {result.searchProfileId}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" onClick={handleRequestBatch} disabled={requestingBatch || syncing}>
                {requestingBatch && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Solicitar novo batch
              </Button>
              <Button variant="outline" size="sm" onClick={handleManualSync} disabled={syncing || requestingBatch || !result}>
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                Sincronizar
              </Button>
              {!parallelData && result?.status === 'PROCESSED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncParallel}
                  disabled={syncingParallel || syncing || parallelInFlight}
                >
                  {(syncingParallel || parallelInFlight) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Database className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Buscar Fontes Adicionais
                </Button>
              )}
              {parallelData && result?.status === 'PROCESSED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncParallel}
                  disabled={syncingParallel || syncing || parallelInFlight}
                >
                  {(syncingParallel || parallelInFlight) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Atualizar Fontes Adicionais
                </Button>
              )}
            </div>
          </div>

          {/* Status indicators */}
          {(result?.status === 'QUEUED' || result?.status === 'PROCESSING' || result?.status === 'PENDING') && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando processamento no upMiner…
            </div>
          )}

          {result?.status === 'ERROR' && result.errorMessage && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              <span>{result.errorMessage}</span>
            </div>
          )}

          {!result && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma consulta upMiner para este cliente. Use &quot;Solicitar novo batch&quot; para iniciar.
            </p>
          )}

          {result?.status === 'PROCESSED' && dossiersData?.dossiers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Processamento concluído, mas não há dossiês persistidos. Tente sincronizar novamente.
            </p>
          )}

          {/* Dossiers */}
          {result?.status === 'PROCESSED' &&
            dossiersData?.dossiers.map((dossier) => (
              <div key={dossier.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <DossierView
                  dossier={dossier}
                  onRequestPdf={requestPdf}
                  pdfLoading={pdfLoadingDossierId === dossier.apiDossierId}
                />
              </div>
            ))}

          {/* Fontes Adicionais — always visible when batch is processed */}
          {result?.status === 'PROCESSED' && (
            <div className="border-t pt-6">
              <ParallelDataSection
                parallelStatus={result.parallelStatus}
                parallelData={parallelData}
                parallelInFlight={parallelInFlight}
                syncingParallel={syncingParallel}
                onSync={handleSyncParallel}
              />
            </div>
          )}

          {/* History */}
          <Card className="border-dashed">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={handleToggleHistory}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-muted-foreground" />
                Histórico de batches
              </div>
              <RotatingChevron isOpen={historyOpen} className="text-muted-foreground" />
            </button>
            <ExpandableContent isOpen={historyOpen}>
              <div className="px-4 pb-4">
                {history === null && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {history?.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum registro.</p>
                )}
                {history && history.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-3">Solicitado</th>
                          <th className="pb-2 pr-3">Status</th>
                          <th className="pb-2 pr-3">Paralelo</th>
                          <th className="pb-2 pr-3">Perfil</th>
                          <th className="pb-2 pr-3">Batch</th>
                          <th className="pb-2">Erro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((row) => {
                          const cfg = upminerStatusBadge(row.status);
                          return (
                            <tr key={row.id} className="border-b border-muted/40 last:border-0">
                              <td className="py-2 pr-3 whitespace-nowrap">{formatDate(row.requestedAt)}</td>
                              <td className="py-2 pr-3"><StatusBadge value={cfg.label} type={cfg.type} /></td>
                              <td className="py-2 pr-3 text-xs text-muted-foreground">{row.parallelStatus ?? '—'}</td>
                              <td className="py-2 pr-3">{row.searchProfileId}</td>
                              <td className="py-2 pr-3">{row.batchId ?? '—'}</td>
                              <td className="py-2 max-w-[200px] truncate text-xs text-destructive">{row.errorMessage ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ExpandableContent>
          </Card>
        </div>
        )}
      </ExpandableContent>
    </Card>
  );
}
