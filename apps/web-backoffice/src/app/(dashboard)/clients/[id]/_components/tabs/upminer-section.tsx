'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Badge, Button, Skeleton } from '@nexus/ui';
import {
  Layers,
  Loader2,
  RefreshCw,
  FileDown,
  Building2,
  Users,
  Scale,
  CheckCircle2,
  History,
  AlertTriangle,
  Database,
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
} from './upminer.types';
import { formatDate, formatCnpj, POLL_INTERVAL_MS, MAX_SYNC_POLL_ATTEMPTS, PDF_POLL_INTERVAL_MS, MAX_PDF_POLL_ATTEMPTS } from './upminer.utils';
import { StatusBadge, upminerStatusBadge, InfoField, CardHeaderSmall } from './upminer.ui';
import { EmpresaPjCard } from './upminer.empresa-pj-card';
import { ProcessosJudiciaisCard } from './upminer.processos-card';
import {
  CadeProcessoItem,
  CertidoesSection,
  SancaoHitsSection,
  MpfSection,
  DjenSection,
  ProconSpSection,
  ReclameAquiSection,
  CrsfnSection,
  TcuSection,
  ContratosSection,
  GoogleHitsSection,
} from './upminer.dossier-cards';

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

  if (loading) return <Skeleton className="h-16 w-full rounded-lg" />;

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
              {!parallelData && (
                <Button variant="outline" size="sm" onClick={handleSyncParallel} disabled={syncingParallel || syncing}>
                  {syncingParallel ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Database className="h-3.5 w-3.5 mr-1.5" />}
                  Empresa PJ / Processos
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

          {parallelInFlight && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando dados adicionais (Empresa PJ / Processos Judiciais)…
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
              <div key={dossier.id} className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">Dossiê {dossier.apiDossierId}</p>
                    <p className="text-xs text-muted-foreground">
                      Critério: {dossier.criterionName || dossier.criterionInput}
                      {dossier.hasUpflag && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Upflag</Badge>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestPdf(dossier.apiDossierId)}
                    disabled={pdfLoadingDossierId === dossier.apiDossierId}
                  >
                    {pdfLoadingDossierId === dossier.apiDossierId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <FileDown className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    PDF do dossiê
                  </Button>
                </div>

                {dossier.sources.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Fontes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dossier.sources.map((s) => (
                        <Badge key={`${dossier.id}-${s.method}`} variant="outline" className="text-[10px] font-normal">
                          {s.name || s.method}
                          {s.hasResult ? <CheckCircle2 className="inline h-3 w-3 ml-1 text-emerald-600" /> : null}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dossier.receitaFederalPj && (
                  <Card>
                    <CardHeaderSmall icon={<Building2 className="h-4 w-4" />} title="Receita Federal — PJ" />
                    <div className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoField label="CNPJ" value={formatCnpj(dossier.receitaFederalPj.cnpj)} />
                        <InfoField label="Tipo" value={dossier.receitaFederalPj.tipo} />
                        <InfoField label="Abertura" value={dossier.receitaFederalPj.dataAbertura} />
                        <InfoField label="Nome empresarial" value={dossier.receitaFederalPj.nomeEmpresarial} />
                        <InfoField label="Nome fantasia" value={dossier.receitaFederalPj.nomeFantasia} />
                        <InfoField label="Atividade principal" value={dossier.receitaFederalPj.atividadeEconomicaPrincipal} />
                      </div>
                      {dossier.receitaFederalPj.secundarias.length > 0 && (
                        <div className="overflow-x-auto">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Atividades secundárias</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left text-xs text-muted-foreground">
                                <th className="pb-2 pr-2">Código</th>
                                <th className="pb-2">Descrição</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dossier.receitaFederalPj.secundarias.map((sec, idx) => (
                                <tr key={`sec-${sec.codigo ?? idx}`} className="border-b border-muted/40 last:border-0">
                                  <td className="py-1.5 pr-2 font-mono text-xs">{sec.codigo ?? '—'}</td>
                                  <td className="py-1.5">{sec.descricao ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {dossier.qsa && (
                  <Card>
                    <CardHeaderSmall icon={<Users className="h-4 w-4" />} title="QSA — Quadro societário" />
                    <div className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoField label="CNPJ" value={formatCnpj(dossier.qsa.cnpj)} />
                        <InfoField label="Razão social" value={dossier.qsa.razaoSocial} />
                        <InfoField label="Capital social" value={dossier.qsa.capitalSocial} />
                        <InfoField label="Data consulta" value={dossier.qsa.dataConsulta} />
                        <InfoField label="PEP (empresa)" value={dossier.qsa.pep} />
                      </div>
                      {dossier.qsa.socios.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left text-xs text-muted-foreground">
                                <th className="pb-2 pr-2">Nome</th>
                                <th className="pb-2 pr-2">CPF/CNPJ</th>
                                <th className="pb-2 pr-2">Qualificação</th>
                                <th className="pb-2 pr-2">%</th>
                                <th className="pb-2">PEP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dossier.qsa.socios.map((soc, idx) => (
                                <tr key={`soc-${soc.cpfCnpj || idx}`} className="border-b border-muted/40 last:border-0">
                                  <td className="py-1.5 pr-2 font-medium">{soc.nome ?? '—'}</td>
                                  <td className="py-1.5 pr-2 font-mono text-xs">{soc.cpfCnpj ?? '—'}</td>
                                  <td className="py-1.5 pr-2">{soc.qualificacao ?? '—'}</td>
                                  <td className="py-1.5 pr-2">{soc.participacao ?? '—'}</td>
                                  <td className="py-1.5 text-xs">{soc.pep ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {dossier.cadeProcessos.length > 0 && (
                  <Card>
                    <CardHeaderSmall icon={<Scale className="h-4 w-4" />} title="CADE — Processos" />
                    <div className="px-4 pb-4 space-y-3">
                      {dossier.cadeProcessos.map((proc) => (
                        <CadeProcessoItem
                          key={proc.apiRowId ?? proc.processo ?? 'cade-proc'}
                          proc={proc}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {dossier.certidoes && dossier.certidoes.length > 0 && (
                  <CertidoesSection certidoes={dossier.certidoes} />
                )}

                {((dossier.sancaoHits && dossier.sancaoHits.length > 0) || dossier.sicaf) && (
                  <SancaoHitsSection hits={dossier.sancaoHits ?? []} sicaf={dossier.sicaf} />
                )}

                {dossier.mpfProcessos && dossier.mpfProcessos.length > 0 && (
                  <MpfSection processos={dossier.mpfProcessos} />
                )}

                {dossier.djenCitacoes && dossier.djenCitacoes.length > 0 && (
                  <DjenSection citacoes={dossier.djenCitacoes} />
                )}

                {dossier.proconAnos && dossier.proconAnos.length > 0 && (
                  <ProconSpSection anos={dossier.proconAnos} />
                )}

                {dossier.reclameAqui && (
                  <ReclameAquiSection data={dossier.reclameAqui} />
                )}

                {dossier.crsfnAcoes && dossier.crsfnAcoes.length > 0 && (
                  <CrsfnSection acoes={dossier.crsfnAcoes} />
                )}

                {dossier.tcuProcessos && dossier.tcuProcessos.length > 0 && (
                  <TcuSection processos={dossier.tcuProcessos} />
                )}

                {dossier.contratos && dossier.contratos.length > 0 && (
                  <ContratosSection contratos={dossier.contratos} />
                )}

                {dossier.googleHits && dossier.googleHits.length > 0 && (
                  <GoogleHitsSection hits={dossier.googleHits} />
                )}
              </div>
            ))}

          {/* Parallel data: Empresa PJ Enriquecida */}
          {parallelData?.empresaPj && (
            <div className="border-t pt-6">
              <EmpresaPjCard empresa={parallelData.empresaPj} />
            </div>
          )}

          {/* Parallel data: Processos Judiciais */}
          {parallelData?.processos && parallelData.processos.length > 0 && (
            <div className="border-t pt-6">
              <ProcessosJudiciaisCard processos={parallelData.processos} />
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
      </ExpandableContent>
    </Card>
  );
}
