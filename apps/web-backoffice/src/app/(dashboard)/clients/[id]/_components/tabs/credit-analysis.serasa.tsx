'use client';

import { Card, CardContent, Button, ScrollArea } from '@nexus/ui';
import { Activity, Landmark, AlertTriangle, Scale, Users, Building2, Code2, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import type { SerasaReportData, BadgeType } from './credit-analysis.types';
import { formatDate, formatCurrency, formatDocument } from './credit-analysis.utils';
import { StatusBadge, InfoField } from './credit-analysis.ui';

// ─── Score badge ──────────────────────────────────────────────────────────────

export function SerasaScoreBadge({ score }: Readonly<{ score: number }>) {
  let label: string;
  let type: BadgeType;
  if (score >= 700) { label = 'Baixo Risco'; type = 'success'; }
  else if (score >= 400) { label = 'Médio Risco'; type = 'warning'; }
  else { label = 'Alto Risco'; type = 'danger'; } // eslint-disable-line sonarjs/no-else-after-if
  return <StatusBadge value={label} type={type} />;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getAnnotationSummary(obj: unknown, ...keys: string[]): { count?: number; balance?: number } | null {
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  for (const key of keys) {
    const v = o[key];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (v && typeof v === 'object' && 'summary' in (v as any)) {
      const s = (v as { summary?: { count?: number; balance?: number } }).summary;
      if (s) return s;
    }
  }
  if (o.summary) return o.summary as { count?: number; balance?: number };
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaScoreCards({ raw }: Readonly<{ raw: any }>) {
  const scores = raw?.optionalFeatures?.score;
  const hlc1 = raw?.optionalFeatures?.scores?.scoreResponse;

  const mainScore = scores?.score;
  const mainMessage = scores?.message;
  const creditLimit = hlc1?.[0]?.score;

  if (!mainScore && !creditLimit) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {mainScore != null && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={15} className="text-primary" />
              <span className="text-sm font-medium">Score Positivo (HPJ8)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{mainScore}</span>
              <SerasaScoreBadge score={Number(mainScore)} />
            </div>
            {mainMessage && <p className="text-xs text-muted-foreground mt-1">{mainMessage}</p>}
          </CardContent>
        </Card>
      )}
      {creditLimit != null && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <Landmark size={15} className="text-primary" />
              <span className="text-sm font-medium">Limite de Crédito (HLC1)</span>
            </div>
            <span className="text-3xl font-bold">{formatCurrency(String(creditLimit))}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaNegativeData({ raw }: Readonly<{ raw: any }>) {
  const report = raw?.reports?.[0];
  const neg = report?.negativeData ?? report;
  const opt = raw?.optionalFeatures ?? {};

  const pefin = getAnnotationSummary(neg, 'pefin', 'pefinResponse', 'spefinResponse') ?? getAnnotationSummary(opt, 'pefin', 'pefinResponse', 'spefinResponse');
  const refin = getAnnotationSummary(neg, 'refin', 'refinResponse') ?? getAnnotationSummary(opt, 'refin', 'refinResponse');
  const notary = getAnnotationSummary(neg, 'notary', 'notaryResponse') ?? getAnnotationSummary(opt, 'notary', 'notaryResponse');
  const check = getAnnotationSummary(neg, 'check', 'checkResponse') ?? getAnnotationSummary(opt, 'check', 'checkResponse');
  const collectionRecords = getAnnotationSummary(neg, 'collectionRecords', 'collectionRecordsResponse') ?? getAnnotationSummary(opt, 'collectionRecords', 'collectionRecordsResponse');

  const hasAny = pefin || refin || notary || check || collectionRecords;
  if (!hasAny) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-destructive" />
          <span className="text-sm font-medium">Anotações Negativas</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {pefin && <NegativeSummaryItem label="PEFIN" count={pefin.count} balance={pefin.balance} />}
          {refin && <NegativeSummaryItem label="REFIN" count={refin.count} balance={refin.balance} />}
          {notary && <NegativeSummaryItem label="Protestos" count={notary.count} balance={notary.balance} />}
          {check && <NegativeSummaryItem label="Cheques" count={check.count} balance={check.balance} />}
          {collectionRecords && <NegativeSummaryItem label="Dívidas Vencidas" count={collectionRecords.count} balance={collectionRecords.balance} />}
        </div>
      </CardContent>
    </Card>
  );
}

function NegativeSummaryItem({ label, count, balance }: Readonly<{ label: string; count?: number; balance?: number }>) {
  const hasIssues = (count ?? 0) > 0;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${hasIssues ? 'text-destructive' : 'text-emerald-600'}`}>
        {count ?? 0} ocorrência(s)
      </p>
      {balance != null && balance > 0 && (
        <p className="text-xs text-muted-foreground">{formatCurrency(String(balance))}</p>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaJudicial({ raw }: Readonly<{ raw: any }>) {
  const report = raw?.reports?.[0];
  const facts = report?.facts ?? report;

  const judgements = getAnnotationSummary(facts, 'judgementFilings', 'judgementFilingsResponse');
  const bankrupts = getAnnotationSummary(facts, 'bankrupts', 'bankruptsResponse');

  if (!judgements && !bankrupts) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Scale size={15} className="text-primary" />
          <span className="text-sm font-medium">Ações Judiciais</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {judgements && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Ações / Execuções</p>
              <p className={`text-sm font-semibold ${(judgements.count ?? 0) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {judgements.count ?? 0} ocorrência(s)
              </p>
              {judgements.balance != null && judgements.balance > 0 && (
                <p className="text-xs text-muted-foreground">{formatCurrency(String(judgements.balance))}</p>
              )}
            </div>
          )}
          {bankrupts && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Falências / Recuperações</p>
              <p className={`text-sm font-semibold ${(bankrupts.count ?? 0) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {bankrupts.count ?? 0} ocorrência(s)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaQsa({ raw }: Readonly<{ raw: any }>) {
  const qsa = raw?.optionalFeatures?.QSAReport;
  if (!qsa) return null;

  const partners = qsa.partnerCompleteReport?.partnersList ?? [];
  const directors = qsa.directorCompleteReport?.directorsList ?? [];
  const capitalSocial = qsa.companyData?.socialCapitalValue;

  if (partners.length === 0 && directors.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-primary" />
            <span className="text-sm font-medium">QSA — Quadro Societário</span>
          </div>
          {capitalSocial != null && (
            <span className="text-xs text-muted-foreground">
              Capital Social: {formatCurrency(String(capitalSocial))}
            </span>
          )}
        </div>

        {partners.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Sócios ({partners.length})</p>
            <div className="grid gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {partners.map((p: any, i: number) => {
                const doc = p.documentId ?? p.documentNumber ?? p.participatedDocumentId ?? p.companyDocumentId;
                const docFormatted = formatDocument(doc, p.documentType);
                return (
                  <div key={`partner-${p.documentId ?? p.documentNumber ?? i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-muted-foreground" />
                      <span className="font-medium">{p.name || 'N/I'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.sinceDate && <span>Entrou em {formatDate(String(p.sinceDate))}</span>}
                      {p.participationPercentage != null && <span>{p.participationPercentage}%</span>}
                      {docFormatted && <span>{docFormatted}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {directors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Diretores ({directors.length})</p>
            <div className="grid gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {directors.map((d: any, i: number) => {
                const doc = d.documentId ?? d.documentNumber ?? d.participatedDocumentId;
                const docFormatted = formatDocument(doc, d.documentType);
                return (
                  <div key={`director-${d.documentId ?? d.documentNumber ?? i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-muted-foreground" />
                      <span className="font-medium">{d.name || 'N/I'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {d.mandateStart && <span>Desde {formatDate(String(d.mandateStart))}</span>}
                      {d.mandateEnd && <span>até {formatDate(String(d.mandateEnd))}</span>}
                      {d.role && <span>{d.role}</span>}
                      {docFormatted && <span>{docFormatted}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaRegistration({ raw }: Readonly<{ raw: any }>) {
  const identification = raw?.reports?.[0]?.identificationReport;
  if (!identification) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-primary" />
          <span className="text-sm font-medium">Dados Cadastrais</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <InfoField label="Razão Social" value={identification.companyName} />
          <InfoField label="CNPJ" value={identification.documentNumber} />
          <InfoField label="Fundação" value={identification.companyFoundation ? formatDate(identification.companyFoundation) : null} />
          {identification.address && (
            <>
              <InfoField label="Endereço" value={identification.address.addressLine} />
              <InfoField label="Cidade / UF" value={
                [identification.address.city, identification.address.state].filter(Boolean).join(' / ') || null
              } />
              <InfoField label="CEP" value={identification.address.zipCode} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SerasaSection (exported) ─────────────────────────────────────────────────

export function SerasaSection({ report, isRequesting, onRequest, viewRaw, toggleRaw }: Readonly<{
  report: SerasaReportData | null;
  isRequesting: boolean;
  onRequest: () => void;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  if (!report) {
    return (
      <div className="px-8 pb-8">
        <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhuma consulta Serasa realizada.</p>
          <Button onClick={onRequest} disabled={isRequesting} size="sm" className="gap-1.5">
            {isRequesting ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            Consultar Serasa
          </Button>
        </div>
      </div>
    );
  }

  const isError = report.statusCode >= 400 || !!report.errorMessage;

  if (isError) {
    return (
      <div className="px-8 pb-8">
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
          <XCircle className="h-6 w-6 text-destructive/60" />
          <p className="text-sm text-destructive">{report.errorMessage || `Erro HTTP ${report.statusCode}`}</p>
          <Button variant="outline" size="sm" onClick={onRequest} disabled={isRequesting}>
            {isRequesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span className="ml-1.5">Tentar Novamente</span>
          </Button>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = report.rawResponse;
  if (!raw) {
    return (
      <div className="px-8 pb-8">
        <p className="text-sm text-muted-foreground text-center py-4">Resposta vazia.</p>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Consultado em {formatDate(report.createdAt)}</span>
          {report.requestId && <span>· ID: {report.requestId}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRequest} disabled={isRequesting} variant="outline" size="sm" className="gap-1.5">
            {isRequesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Nova Consulta
          </Button>
          <Button onClick={() => toggleRaw('serasa-raw')} variant="outline" size="sm" className="gap-1.5">
            <Code2 size={12} />
            {viewRaw['serasa-raw'] ? 'Esconder' : 'JSON'}
          </Button>
        </div>
      </div>

      {viewRaw['serasa-raw'] && (
        <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(raw, null, 2)}</pre>
        </ScrollArea>
      )}

      <SerasaScoreCards raw={raw} />
      <SerasaNegativeData raw={raw} />
      <SerasaJudicial raw={raw} />
      <SerasaQsa raw={raw} />
      <SerasaRegistration raw={raw} />
    </div>
  );
}
