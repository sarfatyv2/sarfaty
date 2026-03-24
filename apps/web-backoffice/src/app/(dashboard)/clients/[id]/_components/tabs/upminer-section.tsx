'use client';

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Card, Badge, Button, Skeleton, ScrollArea } from '@nexus/ui';
import {
  Layers,
  Loader2,
  RefreshCw,
  FileDown,
  Building2,
  Users,
  Scale,
  ChevronDown,
  History,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';
import { ExpandableHeader } from './client-credit-analysis-tab';

type UpminerResultStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'ERROR';

interface UpminerResultDto {
  id: string;
  clientId: string;
  document: string;
  inputType: number;
  searchProfileId: number;
  batchId: number | null;
  status: UpminerResultStatus;
  dossiersData: Record<string, unknown> | null;
  errorMessage: string | null;
  requestedAt: string;
  processedAt: string | null;
}

interface UpminerDossiersDataReceitaSecundaria {
  codigo: string | null;
  descricao: string | null;
  ordem: number;
}

interface UpminerDossiersDataReceitaFederalPj {
  cnpj: string | null;
  tipo: string | null;
  dataAbertura: string | null;
  nomeEmpresarial: string | null;
  nomeFantasia: string | null;
  atividadeEconomicaPrincipal: string | null;
  secundarias: UpminerDossiersDataReceitaSecundaria[];
}

interface UpminerDossiersDataQsaSocio {
  cpfCnpj: string | null;
  nome: string | null;
  entrada: string | null;
  qualificacao: string | null;
  participacao: string | null;
  situacao: string | null;
  pep: string | null;
  tipoSocio: string | null;
}

interface UpminerDossiersDataQsa {
  cnpj: string | null;
  razaoSocial: string | null;
  capitalSocial: string | null;
  dataConsulta: string | null;
  pep: string | null;
  socios: UpminerDossiersDataQsaSocio[];
}

interface UpminerDossiersDataCadeProtocolo {
  docProcesso: string | null;
  tipoDoc: string | null;
  dataDocumento: string | null;
  dataRegistro: string | null;
  unidade: string | null;
  linkPdf: string | null;
}

interface UpminerDossiersDataCadeAndamento {
  dataHora: string | null;
  unidade: string | null;
  descricao: string | null;
}

interface UpminerDossiersDataCadeProcesso {
  apiRowId: string | null;
  estado: string | null;
  processo: string | null;
  tipo: string | null;
  dataRegistro: string | null;
  resumoInt: string | null;
  interessados: string[] | null;
  protocolos: UpminerDossiersDataCadeProtocolo[];
  andamentos: UpminerDossiersDataCadeAndamento[];
}

interface UpminerDossiersDataSource {
  method: string;
  name: string | null;
  hasResult: boolean;
  processedStatus: string | null;
}

interface UpminerDossiersDataDossier {
  id: string;
  apiDossierId: number;
  criterionInput: string;
  criterionName: string | null;
  dossierStatus: string | null;
  dossierState: string | null;
  hasUpflag: boolean;
  searchProfileName: string | null;
  createdAtApi: string | null;
  processedAtApi: string | null;
  sources: UpminerDossiersDataSource[];
  receitaFederalPj: UpminerDossiersDataReceitaFederalPj | null;
  qsa: UpminerDossiersDataQsa | null;
  cadeProcessos: UpminerDossiersDataCadeProcesso[];
}

interface UpminerDossiersDataPayload {
  dossiers: UpminerDossiersDataDossier[];
}

interface UpminerPdfRequestResponse {
  id_processo: string;
}

interface UpminerPdfDownloadResponse {
  id: string;
  status: string;
  url: string | null;
  created_at: string;
  end_at: string | null;
}

const POLL_INTERVAL_MS = 5_000;
const MAX_SYNC_POLL_ATTEMPTS = 30;
const PDF_POLL_INTERVAL_MS = 2_000;
const MAX_PDF_POLL_ATTEMPTS = 30;

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return '—';
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

function StatusBadge({ value, type }: Readonly<{ value: string; type: BadgeType }>) {
  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  };
  return <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5`}>{value}</Badge>;
}

function upminerStatusBadge(status: UpminerResultStatus): { label: string; type: BadgeType } {
  const map: Record<UpminerResultStatus, { label: string; type: BadgeType }> = {
    PENDING: { label: 'Pendente', type: 'neutral' },
    QUEUED: { label: 'Na fila', type: 'warning' },
    PROCESSING: { label: 'Processando', type: 'warning' },
    PROCESSED: { label: 'Concluído', type: 'success' },
    ERROR: { label: 'Erro', type: 'danger' },
  };
  return map[status] ?? { label: status, type: 'neutral' };
}

function InfoField({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium leading-none">{value || '—'}</p>
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
  const [history, setHistory] = useState<UpminerResultDto[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [requestingBatch, setRequestingBatch] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pdfLoadingDossierId, setPdfLoadingDossierId] = useState<number | null>(null);
  const [expandedCadeProc, setExpandedCadeProc] = useState<Record<string, boolean>>({});

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
      if (res.data && res.data.dossiers?.length) {
        setDossiersData(res.data);
      } else {
        setDossiersData(res.data ?? { dossiers: [] });
      }
    } catch {
      setDossiersData(null);
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
    (async () => {
      setLoading(true);
      const r = await loadResult();
      if (cancelled) return;
      if (r?.status === 'PROCESSED') {
        await loadDossiersData();
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId, loadResult, loadDossiersData]);

  useEffect(() => {
    const shouldPoll =
      result &&
      (result.status === 'QUEUED' || result.status === 'PROCESSING' || result.status === 'PENDING');

    if (!shouldPoll) {
      stopPolling();
      return;
    }

    void (async () => {
      const next = await runSync();
      if (next?.status === 'PROCESSED') {
        stopPolling();
        toast.success('Consulta upMiner concluída.');
        await loadDossiersData();
      } else if (next?.status === 'ERROR') {
        stopPolling();
        toast.error(next.errorMessage || 'Erro no processamento upMiner.');
      }
    })();

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current > MAX_SYNC_POLL_ATTEMPTS) {
        stopPolling();
        toast.warning('Tempo limite ao aguardar o processamento do upMiner.');
        return;
      }

      const next = await runSync();
      if (next?.status === 'PROCESSED') {
        stopPolling();
        toast.success('Consulta upMiner concluída.');
        await loadDossiersData();
      } else if (next?.status === 'ERROR') {
        stopPolling();
        toast.error(next.errorMessage || 'Erro no processamento upMiner.');
      }
    }, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [result?.status, result?.id, runSync, stopPolling, loadDossiersData]);

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
    if (next?.status === 'PROCESSED') {
      await loadDossiersData();
      toast.success('Sincronizado.');
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
      if (!processId) {
        toast.error('Resposta inválida ao solicitar PDF.');
        return;
      }

      for (let attempt = 0; attempt < MAX_PDF_POLL_ATTEMPTS; attempt += 1) {
        await new Promise((r) => setTimeout(r, PDF_POLL_INTERVAL_MS));
        const statusRes = await api.get<UpminerPdfDownloadResponse>(
          `${basePath}/upminer/dossier/${apiDossierId}/pdf/${processId}`,
        );
        const payload = statusRes.data;
        if (payload?.url) {
          window.open(payload.url, '_blank', 'noopener,noreferrer');
          toast.success('PDF disponível.');
          return;
        }
        const st = payload?.status?.toLowerCase() ?? '';
        if (st.includes('error') || st.includes('fail')) {
          toast.error('Falha ao gerar PDF no upMiner.');
          return;
        }
      }
      toast.warning('Tempo limite ao aguardar o PDF.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar PDF';
      toast.error(message);
    } finally {
      setPdfLoadingDossierId(null);
    }
  };

  const statusCfg = result ? upminerStatusBadge(result.status) : null;

  if (loading) {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }

  return (
    <Card className="overflow-hidden">
      <ExpandableHeader
        icon={<Layers size={15} className="text-primary" />}
        title="upMiner"
        subtitle="Dossiês e fontes"
        badge={
          statusCfg ? <StatusBadge value={statusCfg.label} type={statusCfg.type} /> : undefined
        }
        isOpen={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      <ExpandableContent isOpen={expanded}>
        <div className="px-8 pb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground space-y-0.5">
              {result?.requestedAt && (
                <p>Solicitado em {formatDate(result.requestedAt)}</p>
              )}
              {result?.batchId != null && <p>Batch ID: {result.batchId}</p>}
              {result?.searchProfileId != null && <p>Perfil: {result.searchProfileId}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleRequestBatch}
                disabled={requestingBatch || syncing}
              >
                {requestingBatch ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Solicitar novo batch
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={syncing || requestingBatch || !result}
              >
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                Sincronizar
              </Button>
            </div>
          </div>

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

          {result?.status === 'PROCESSED' && dossiersData && dossiersData.dossiers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Processamento concluído, mas não há dossiês persistidos. Tente sincronizar novamente.
            </p>
          )}

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
                        <Badge key={s.method} variant="outline" className="text-[10px] font-normal">
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
                        <InfoField
                          label="Atividade principal"
                          value={dossier.receitaFederalPj.atividadeEconomicaPrincipal}
                        />
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
                                <tr key={`soc-${soc.cpfCnpj ?? idx}`} className="border-b border-muted/40 last:border-0">
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
                      {dossier.cadeProcessos.map((proc, pi) => {
                        const key = `${dossier.id}-cade-${proc.apiRowId ?? pi}`;
                        const open = expandedCadeProc[key] ?? false;
                        return (
                          <div key={key} className="rounded-md border border-muted/60">
                            <button
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                              onClick={() =>
                                setExpandedCadeProc((prev) => ({ ...prev, [key]: !open }))
                              }
                            >
                              <span className="font-medium">
                                {proc.processo || proc.apiRowId || 'Processo'}
                                {proc.estado ? (
                                  <span className="text-muted-foreground font-normal ml-2">{proc.estado}</span>
                                ) : null}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {open && (
                              <div className="border-t px-3 py-3 space-y-3 text-sm">
                                {proc.tipo && (
                                  <p>
                                    <span className="text-muted-foreground">Tipo:</span> {proc.tipo}
                                  </p>
                                )}
                                {proc.dataRegistro && (
                                  <p>
                                    <span className="text-muted-foreground">Registro:</span> {proc.dataRegistro}
                                  </p>
                                )}
                                {proc.resumoInt && (
                                  <ScrollArea className="max-h-32 rounded border bg-muted/20 p-2 text-xs">
                                    {proc.resumoInt}
                                  </ScrollArea>
                                )}
                                {proc.interessados && proc.interessados.length > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Interessados</p>
                                    <ul className="list-disc pl-4 text-xs">
                                      {proc.interessados.map((it, ii) => (
                                        <li key={`int-${ii}`}>{it}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {proc.protocolos.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Protocolos</p>
                                    <div className="space-y-2">
                                      {proc.protocolos.map((pr, pri) => (
                                        <div key={`proto-${pri}`} className="rounded border border-muted/50 p-2 text-xs">
                                          <p>{pr.tipoDoc} — {pr.docProcesso}</p>
                                          {pr.linkPdf && (
                                            <a
                                              href={pr.linkPdf}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary underline"
                                            >
                                              PDF
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {proc.andamentos.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Andamentos</p>
                                    <ul className="space-y-1 text-xs">
                                      {proc.andamentos.map((a, ai) => (
                                        <li key={`and-${ai}`} className="border-l-2 pl-2 border-muted">
                                          <span className="text-muted-foreground">{a.dataHora}</span> — {a.descricao}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            ))}

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
                {history && history.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum registro.</p>
                )}
                {history && history.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-3">Solicitado</th>
                          <th className="pb-2 pr-3">Status</th>
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
                              <td className="py-2 pr-3">
                                <StatusBadge value={cfg.label} type={cfg.type} />
                              </td>
                              <td className="py-2 pr-3">{row.searchProfileId}</td>
                              <td className="py-2 pr-3">{row.batchId ?? '—'}</td>
                              <td className="py-2 max-w-[200px] truncate text-xs text-destructive">
                                {row.errorMessage ?? '—'}
                              </td>
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

function CardHeaderSmall({ icon, title }: Readonly<{ icon: ReactNode; title: string }>) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2.5">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}
