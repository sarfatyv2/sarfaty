'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button, ScrollArea } from '@nexus/ui';
import { FileText, XCircle, Code2, Building2, MapPin, Activity, Leaf, Users, FileBarChart, Loader2, Download, Shield, AlertTriangle, CheckCircle2, Scale, Landmark, Globe, UserCheck, Search, Monitor, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

interface VaduPersonResult {
  id: string;
  authorizedPersonId: string | null;
  cpf: string;
  name: string | null;
  birthDate: string | null;
  motherName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduCompanyResult {
  id: string;
  cnpj: string;
  companyName: string | null;
  tradeName: string | null;
  revenueStatus: string | null;
  revenueStatusDate: string | null;
  specialStatus: string | null;
  capitalSocial: string | null;
  legalNature: string | null;
  isSimplesNacional: boolean | null;
  companySize: string | null;
  environmentalScore: number | null;
  environmentalLevel: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduResultsOutput {
  company: VaduCompanyResult | null;
  persons: VaduPersonResult[];
}

function formatCpf(cpf: string): string {
  const digits = cpf.replaceAll(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replaceAll(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function resolveDisplayValue(value?: string | null | boolean | number): string | number {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return value || '—';
}

function InfoField({ label, value, valueNode }: Readonly<{ label: string; value?: string | null | boolean | number; valueNode?: React.ReactNode }>) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {valueNode ? (
        <div>{valueNode}</div>
      ) : (
        <p className="text-sm font-medium leading-none">{resolveDisplayValue(value)}</p>
      )}
    </div>
  );
}

function StatusBadge({ value, type }: Readonly<{ value: string | null | undefined; type: BadgeType }>) {
  if (!value) return <span className="text-sm font-medium">—</span>;
  
  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  };

  return (
    <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5`}>
      {value}
    </Badge>
  );
}

function getRevenueStatusType(status: string | null | undefined): BadgeType {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (s === 'ATIVA') return 'success';
  if (s === 'INATIVA' || s === 'BAIXADA' || s === 'SUSPENSA' || s === 'INAPTA') return 'danger';
  return 'neutral';
}

function getEnvironmentalStatusType(level: string | null | undefined): BadgeType {
  if (!level) return 'neutral';
  const l = level.toLowerCase();
  if (l.includes('sem risco') || l.includes('baixo')) return 'success';
  if (l.includes('alto') || l.includes('crítico')) return 'danger';
  if (l.includes('médio')) return 'warning';
  return 'neutral';
}

interface CreditboxReport {
  id: string;
  clientId: string;
  processId: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  reportJson: Record<string, unknown> | null;
  pdfBase64: string | null;
  errorMessage: string | null;
  requestedAt: string;
  completedAt: string | null;
}

interface SerasaReportData {
  id: string;
  clientId: string;
  cnpj: string;
  reportName: string;
  optionalFeatures: string[] | null;
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse: any;
  errorMessage: string | null;
  requestId: string | null;
  createdAt: string;
}

type ComplianceCheckName =
  | 'cgu' | 'pep' | 'pgfn' | 'cndt'
  | 'addressValidation' | 'sanctions' | 'slaveLaborCheck'
  | 'negativeMedia' | 'digitalPresence';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ComplianceResults {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';
  pendingChecks: ComplianceCheckName[];
  cgu: {
    ceis: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cnep: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cepim: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
  };
  pep: Array<{
    cpf: string; personName: string | null; hasMatch: boolean;
    matchedRole: string | null; matchedOrg: string | null; rawData: any; queriedAt: string | null;
  }>;
  pgfn: { hasDebt: boolean; totalDebtAmount: number | null; debtCount: number; summary: string | null; rawData: any; queriedAt: string | null } | null;
  cndt: { certificateStatus: string; certificateNumber: string | null; validUntil: string | null; rawData: any; queriedAt: string | null } | null;
  addressValidation: {
    cep: string | null; isValid: boolean; street: string | null; neighborhood: string | null;
    city: string | null; state: string | null; matchesRegistered: boolean | null; rawData: any; queriedAt: string | null;
  } | null;
  sanctions: Array<{
    entityName: string | null; source: string; hasMatch: boolean;
    matchScore: number | null; matchDetails: string | null; rawData: any; queriedAt: string | null;
  }>;
  slaveLaborCheck: {
    hasMatch: boolean; employerName: string | null; rescuedWorkers: number | null;
    inspectionDate: string | null; rawData: any; queriedAt: string | null;
  } | null;
  negativeMedia: Array<{
    id: string; riskLevel: string; findingsCount: number;
    findings: Array<{
      category: string; title: string; snippet: string;
      sourceUrl: string | null; sourceName: string | null; date: string | null;
    }>;
    summary: string | null; groundingSources: Array<{ uri: string; title: string }>;
    queriedAt: string;
  }>;
  digitalPresence: {
    domain: string | null; emailType: string;
    hasDns: boolean; hasActiveSite: boolean;
    siteTitle: string | null; queriedAt: string | null;
  } | null;
}

function RiskBadge({ level }: Readonly<{ level: ComplianceResults['overallRisk'] }>) {
  const config: Record<string, { label: string; type: BadgeType }> = {
    CRITICAL: { label: 'Risco Crítico', type: 'danger' },
    HIGH: { label: 'Risco Alto', type: 'danger' },
    MEDIUM: { label: 'Risco Médio', type: 'warning' },
    LOW: { label: 'Risco Baixo', type: 'success' },
    CLEAR: { label: 'Sem Restrições', type: 'success' },
    PENDING: { label: 'Pendente', type: 'neutral' },
  };
  const c = config[level] ?? config.PENDING;
  return <StatusBadge value={c?.label} type={c?.type ?? 'neutral'} />;
}

function CheckRow({ label, icon, hasMatch, detail, queriedAt, rawData, viewRaw, onToggleRaw }: Readonly<{
  label: string;
  icon: React.ReactNode;
  hasMatch: boolean | null;
  detail?: string | null;
  queriedAt?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData?: any;
  viewRaw?: boolean;
  onToggleRaw?: () => void;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
          {hasMatch === true && <StatusBadge value="Encontrado" type="danger" />}
          {hasMatch === false && <StatusBadge value="Nada consta" type="success" />}
          {hasMatch === null && <StatusBadge value="N/A" type="neutral" />}
        </div>
        <div className="flex items-center gap-2">
          {queriedAt && <span className="text-[10px] text-muted-foreground">{formatDate(queriedAt)}</span>}
          {rawData && onToggleRaw && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleRaw}>
              <Code2 size={11} className="text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      {detail && <p className="text-xs text-muted-foreground pl-6">{detail}</p>}
      {viewRaw && rawData && (
        <ScrollArea className="h-40 rounded-lg border bg-muted/30 p-3 ml-6">
          <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
        </ScrollArea>
      )}
    </div>
  );
}

function CndtBadge({ status }: Readonly<{ status: string }>) {
  const map: Record<string, { label: string; type: BadgeType }> = {
    NEGATIVE: { label: 'Negativa', type: 'success' },
    POSITIVE_WITH_EFFECTS: { label: 'Positiva c/ efeito', type: 'warning' },
    POSITIVE: { label: 'Positiva', type: 'danger' },
    UNAVAILABLE: { label: 'Indisponível', type: 'warning' },
    UNKNOWN: { label: 'Indisponível', type: 'warning' },
  };
  const c = map[status] ?? { label: status, type: 'neutral' as BadgeType };
  return <StatusBadge value={c.label} type={c.type} />;
}

function CndtStatusContent({ cndt }: Readonly<{ cndt: NonNullable<ComplianceResults['cndt']> }>) {
  const isUnavailable = cndt.certificateStatus === 'UNAVAILABLE' || cndt.certificateStatus === 'UNKNOWN';
  const rawReason = (cndt.rawData as Record<string, unknown> | null)?.reason;

  if (isUnavailable) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-amber-500" />
            <span className="text-sm font-medium">Verificação Manual Necessária</span>
            <StatusBadge value="Indisponível" type="warning" />
          </div>
          <span className="text-[10px] text-muted-foreground">{formatDate(cndt.queriedAt)}</span>
        </div>
        <p className="text-xs text-muted-foreground pl-6">
          {typeof rawReason === 'string' && rawReason
            ? rawReason
            : 'O portal do TST requer CAPTCHA para emissão de certidão. Consulte manualmente em '}
          {!rawReason && (
            <a
              href="https://cndt-certidao.tst.jus.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              cndt-certidao.tst.jus.br
            </a>
          )}
        </p>
      </div>
    );
  }

  const cndtStatusMap = {
    NEGATIVE: { label: 'Negativa', type: 'success' as BadgeType },
    POSITIVE_WITH_EFFECTS: { label: 'Positiva c/ efeito de Negativa', type: 'warning' as BadgeType },
    POSITIVE: { label: 'Positiva', type: 'danger' as BadgeType },
  };
  const mapped = cndtStatusMap[cndt.certificateStatus as keyof typeof cndtStatusMap];
  const { label: statusLabel, type: statusType } = mapped ?? cndtStatusMap.POSITIVE;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cndt.certificateStatus === 'NEGATIVE' ? (
            <CheckCircle2 size={13} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={13} className="text-destructive" />
          )}
          <span className="text-sm font-medium">Certidão</span>
          <StatusBadge value={statusLabel} type={statusType} />
        </div>
        <span className="text-[10px] text-muted-foreground">{formatDate(cndt.queriedAt)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pl-6">
        {cndt.certificateNumber && (
          <InfoField label="N° Certidão" value={cndt.certificateNumber} />
        )}
        {cndt.validUntil && (
          <InfoField label="Validade" value={formatDate(cndt.validUntil)} />
        )}
      </div>
    </div>
  );
}

function ExpandableHeader({ icon, title, subtitle, badge, isOpen, onToggle }: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between px-8 py-5 cursor-pointer text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {badge}
      </div>
      <RotatingChevron isOpen={isOpen} className="text-muted-foreground" />
    </button>
  );
}

function SerasaSection({ report, isRequesting, onRequest, viewRaw, toggleRaw }: Readonly<{
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
  const raw = report.rawResponse as any;
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

function SerasaScoreBadge({ score }: Readonly<{ score: number }>) {
  let label: string;
  let type: BadgeType;
  if (score >= 700) { label = 'Baixo Risco'; type = 'success'; }
  else if (score >= 400) { label = 'Médio Risco'; type = 'warning'; }
  else { label = 'Alto Risco'; type = 'danger'; }
  return <StatusBadge value={label} type={type} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SerasaNegativeData({ raw }: Readonly<{ raw: any }>) {
  const neg = raw?.reports?.[0]?.negativeData;
  if (!neg) return null;

  const pefin = neg.pefin?.summary;
  const refin = neg.refin?.summary;
  const notary = neg.notary?.summary;
  const check = neg.check?.summary;

  const hasAny = pefin || refin || notary || check;
  if (!hasAny) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-destructive" />
          <span className="text-sm font-medium">Anotações Negativas</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {pefin && <NegativeSummaryItem label="PEFIN" count={pefin.count} balance={pefin.balance} />}
          {refin && <NegativeSummaryItem label="REFIN" count={refin.count} balance={refin.balance} />}
          {notary && <NegativeSummaryItem label="Protestos" count={notary.count} balance={notary.balance} />}
          {check && <NegativeSummaryItem label="Cheques" count={check.count} balance={check.balance} />}
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
  const facts = raw?.reports?.[0]?.facts;
  if (!facts) return null;

  const judgements = facts.judgementFilings?.summary;
  const bankrupts = facts.bankrupts?.summary;

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
              {partners.map((p: any, i: number) => (
                <div key={`partner-${p.documentNumber || i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-muted-foreground" />
                    <span className="font-medium">{p.name || 'N/I'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {p.participationPercentage != null && <span>{p.participationPercentage}%</span>}
                    {p.documentNumber && <span>{p.documentNumber}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {directors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Diretores ({directors.length})</p>
            <div className="grid gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {directors.map((d: any, i: number) => (
                <div key={`director-${d.documentNumber || i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck size={13} className="text-muted-foreground" />
                    <span className="font-medium">{d.name || 'N/I'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.role && <span>{d.role}</span>}
                  </div>
                </div>
              ))}
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

function VaduSection({ data, creditbox, viewRaw, toggleRaw, isRequestingCreditbox, handleRequestCreditbox, handleDownloadPdf }: Readonly<{
  data: VaduResultsOutput;
  creditbox: CreditboxReport | null;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  isRequestingCreditbox: boolean;
  handleRequestCreditbox: () => void;
  handleDownloadPdf: () => void;
}>) {
  return (
    <div className="px-8 pb-8 space-y-8">
      <CreditboxCard
        creditbox={creditbox}
        viewRaw={viewRaw}
        toggleRaw={toggleRaw}
        isRequestingCreditbox={isRequestingCreditbox}
        handleRequestCreditbox={handleRequestCreditbox}
        handleDownloadPdf={handleDownloadPdf}
      />
      {data.company && <CompanyAnalysis company={data.company} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
      {data.persons.length > 0 && <PersonsList persons={data.persons} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
    </div>
  );
}

function CreditboxCard({ creditbox, viewRaw, toggleRaw, isRequestingCreditbox, handleRequestCreditbox, handleDownloadPdf }: Readonly<{
  creditbox: CreditboxReport | null;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  isRequestingCreditbox: boolean;
  handleRequestCreditbox: () => void;
  handleDownloadPdf: () => void;
}>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportJson = creditbox?.reportJson as any;
  return (
    <Card className={`overflow-hidden ${creditbox?.status === 'ERROR' ? 'border-destructive/30' : ''}`}>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileBarChart size={15} className="text-primary" />
              <span className="text-sm font-medium">Relatório CreditBox</span>
            </div>
            {creditbox ? (
              <div className="flex items-center gap-2">
                {creditbox.status === 'COMPLETED' && creditbox.pdfBase64 && (
                  <Button onClick={handleDownloadPdf} size="sm" className="gap-1.5">
                    <Download size={12} />
                    Baixar PDF
                  </Button>
                )}
                {creditbox.status === 'COMPLETED' && (
                  <Button onClick={() => toggleRaw(creditbox.id)} variant="outline" size="sm" className="gap-1.5">
                    <Code2 size={12} />
                    {viewRaw[creditbox.id] ? 'Esconder' : 'JSON'}
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={(e) => { e.stopPropagation(); handleRequestCreditbox(); }} disabled={isRequestingCreditbox} size="sm" className="gap-1.5">
                {isRequestingCreditbox ? <Loader2 size={12} className="animate-spin" /> : <FileBarChart size={12} />}
                Gerar Relatório
              </Button>
            )}
          </div>

          {!creditbox && (
            <p className="text-xs text-muted-foreground">
              Análise profunda com Score, Restritivos, Dívidas PGFN e mais.
            </p>
          )}

          {creditbox && (creditbox.status === 'PENDING' || creditbox.status === 'PROCESSING') && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando relatório...</p>
            </div>
          )}

          {creditbox?.status === 'ERROR' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <XCircle className="h-6 w-6 text-destructive/60" />
              <p className="text-sm text-destructive">{creditbox.errorMessage || 'Erro desconhecido'}</p>
              <Button variant="outline" size="sm" onClick={handleRequestCreditbox} disabled={isRequestingCreditbox}>
                Tentar Novamente
              </Button>
            </div>
          )}

          {creditbox?.status === 'COMPLETED' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <InfoField label="Solicitado em" value={formatDate(creditbox.requestedAt)} />
                <InfoField label="Concluído em" value={formatDate(creditbox.completedAt)} />
                {reportJson?.gerais?.score && (
                  <InfoField label="Score CreditBox" value={reportJson.gerais.score.valor} />
                )}
              </div>
              {viewRaw[creditbox.id] && (
                <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
                  <pre className="text-xs">{JSON.stringify(creditbox.reportJson, null, 2)}</pre>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyAnalysis({ company, viewRaw, toggleRaw }: Readonly<{
  company: VaduCompanyResult;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
          <Building2 size={15} className="text-primary" />
          Análise da Empresa
          <span className="text-xs text-muted-foreground font-normal">
            Atualizado em {formatDate(company.queriedAt)}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={() => toggleRaw(company.id)} className="gap-1.5 h-7 text-xs">
          <Code2 size={12} />
          {viewRaw[company.id] ? 'Esconder' : 'JSON'}
        </Button>
      </div>

      {viewRaw[company.id] && (
        <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
          <pre className="text-xs">{JSON.stringify(company.rawData, null, 2)}</pre>
        </ScrollArea>
      )}

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 size={15} className="text-primary" />
              Informações Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="CNPJ" value={formatCnpj(company.cnpj)} />
              <InfoField label="Razão Social" value={company.companyName} />
              <InfoField label="Nome Fantasia" value={company.tradeName} />
              <InfoField label="Capital Social" value={formatCurrency(company.capitalSocial)} />
              <InfoField label="Data de Abertura" value={formatDate(company.rawData?.ReceitaAbertura)} />
              <InfoField label="Tipo (Matriz/Filial)" value={company.rawData?.ReceitaTipo} />
              <InfoField label="Porte" value={company.companySize} />
              <InfoField label="Simples Nacional" valueNode={
                <StatusBadge
                  value={company.isSimplesNacional ? 'Optante' : 'Não Optante'}
                  type={company.isSimplesNacional ? 'success' : 'neutral'}
                />
              } />
              <div className="col-span-2">
                <InfoField label="Natureza Jurídica" value={company.legalNature} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              Situação e Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Situação Receita" valueNode={
                <StatusBadge value={company.revenueStatus} type={getRevenueStatusType(company.revenueStatus)} />
              } />
              <InfoField label="Data Situação" value={formatDate(company.revenueStatusDate)} />
              <div className="col-span-2">
                <InfoField label="Situação Especial" valueNode={
                  company.specialStatus
                    ? <StatusBadge value={company.specialStatus} type="warning" />
                    : <span className="text-sm">—</span>
                } />
              </div>
              <div className="col-span-2">
                <InfoField label="Atividade Principal" value={company.rawData?.ReceitaAtividade} />
              </div>
              <div className="col-span-2">
                <InfoField label="Atividade Secundária" value={company.rawData?.ReceitaAtividadeSecundaria} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin size={15} className="text-primary" />
              Contato e Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Telefone" value={company.rawData?.TelefonePrincipal} />
              <InfoField label="E-mail" value={company.rawData?.EmailPrincipal} />
              <div className="col-span-2">
                <InfoField label="Endereço Completo" value={
                  [
                    company.rawData?.Logradouro,
                    company.rawData?.NumeroLogradouro ? `nº ${company.rawData?.NumeroLogradouro}` : null,
                    company.rawData?.ComplementoEndereco,
                    company.rawData?.BairroEndereco,
                    company.rawData?.MunicipioEndereco,
                    company.rawData?.UfEndereco,
                    company.rawData?.CepEnderecoFormatado,
                  ].filter(Boolean).join(', ') || null
                } />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf size={15} className="text-primary" />
              Risco Ambiental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Nível de Risco" valueNode={
                <StatusBadge value={company.environmentalLevel} type={getEnvironmentalStatusType(company.environmentalLevel)} />
              } />
              <InfoField label="Score Ambiental" value={company.environmentalScore} />
              {company.rawData?.RecursoAmbiental?.potencialidade && (
                <div className="col-span-2">
                  <InfoField label="Potencialidade" value={company.rawData.RecursoAmbiental.potencialidade} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PersonsList({ persons, viewRaw, toggleRaw }: Readonly<{
  persons: VaduPersonResult[];
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium flex items-center gap-2">
        <Users size={15} className="text-primary" />
        Sócios e Pessoas Autorizadas
      </p>
      <div className="space-y-4">
        {persons.map((person) => (
          <Card key={person.id} className="overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {person.name || formatCpf(person.cpf)}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleRaw(person.id)}>
                  <Code2 size={12} className="text-muted-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <InfoField label="CPF" value={formatCpf(person.cpf)} />
                  <InfoField label="Nascimento" value={formatDate(person.birthDate)} />
                  <div className="col-span-2">
                    <InfoField label="Nome da Mãe" value={person.motherName} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Atualizado em {formatDate(person.queriedAt)}
                </p>
                {viewRaw[person.id] && (
                  <ScrollArea className="h-48 rounded-lg border bg-muted/30 p-4">
                    <pre className="text-xs">{JSON.stringify(person.rawData, null, 2)}</pre>
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ComplianceSubCard({ icon, title, badge, children, defaultOpen = false }: Readonly<{
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-3 cursor-pointer text-left bg-gradient-to-r from-primary/5 to-transparent"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
        <RotatingChevron isOpen={isOpen} className="text-muted-foreground" />
      </button>
      <ExpandableContent isOpen={isOpen}>
        <CardContent className="pt-3">{children}</CardContent>
      </ExpandableContent>
    </Card>
  );
}

function CguSubCard({ cgu, viewRaw, toggleRaw }: Readonly<{
  cgu: ComplianceResults['cgu'];
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const hasAny = cgu.ceis.hasMatch || cgu.cnep.hasMatch || cgu.cepim.hasMatch;
  return (
    <ComplianceSubCard
      icon={<Landmark size={15} className="text-primary" />}
      title="CGU — Portal da Transparência"
      badge={<StatusBadge value={hasAny ? 'Restrição' : 'Nada consta'} type={hasAny ? 'danger' : 'success'} />}
    >
      <div className="space-y-3">
        <CheckRow
          label="CEIS — Empresas Inidôneas"
          icon={<AlertTriangle size={13} className={cgu.ceis.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
          hasMatch={cgu.ceis.hasMatch}
          detail={cgu.ceis.summary}
          queriedAt={cgu.ceis.queriedAt}
          rawData={cgu.ceis.rawData}
          viewRaw={viewRaw['cgu-ceis']}
          onToggleRaw={() => toggleRaw('cgu-ceis')}
        />
        <CheckRow
          label="CNEP — Empresas Punidas"
          icon={<AlertTriangle size={13} className={cgu.cnep.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
          hasMatch={cgu.cnep.hasMatch}
          detail={cgu.cnep.summary}
          queriedAt={cgu.cnep.queriedAt}
          rawData={cgu.cnep.rawData}
          viewRaw={viewRaw['cgu-cnep']}
          onToggleRaw={() => toggleRaw('cgu-cnep')}
        />
        <CheckRow
          label="CEPIM — Entidades Impedidas"
          icon={<AlertTriangle size={13} className={cgu.cepim.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
          hasMatch={cgu.cepim.hasMatch}
          detail={cgu.cepim.summary}
          queriedAt={cgu.cepim.queriedAt}
          rawData={cgu.cepim.rawData}
          viewRaw={viewRaw['cgu-cepim']}
          onToggleRaw={() => toggleRaw('cgu-cepim')}
        />
      </div>
    </ComplianceSubCard>
  );
}

function SanctionsSubCard({ sanctions, viewRaw, toggleRaw }: Readonly<{
  sanctions: ComplianceResults['sanctions'];
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const hasAny = sanctions.some((s) => s.hasMatch);
  return (
    <ComplianceSubCard
      icon={<Globe size={15} className="text-primary" />}
      title="Sanções Internacionais (OFAC/UN)"
      badge={<StatusBadge value={hasAny ? 'Encontrado' : 'Nada consta'} type={hasAny ? 'danger' : 'success'} />}
    >
      <div className="space-y-3">
        {sanctions.map((s) => (
          <CheckRow
            key={`sanc-${s.source}-${s.entityName ?? 'unknown'}`}
            label={`${s.source} — ${s.entityName || 'Empresa'}`}
            icon={<Globe size={13} className={s.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
            hasMatch={s.hasMatch}
            detail={s.matchDetails}
            queriedAt={s.queriedAt}
            rawData={s.rawData}
            viewRaw={viewRaw[`sanc-${s.source}-${s.entityName ?? 'unknown'}`]}
            onToggleRaw={() => toggleRaw(`sanc-${s.source}-${s.entityName ?? 'unknown'}`)}
          />
        ))}
      </div>
    </ComplianceSubCard>
  );
}

function PendingCheckCard({ icon, title }: Readonly<{ icon: React.ReactNode; title: string }>) {
  return (
    <Card className="overflow-hidden opacity-60">
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5 animate-pulse">
            Consultando...
          </Badge>
        </div>
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
      </div>
    </Card>
  );
}

const PENDING_CHECK_LABELS: Record<ComplianceCheckName, { icon: React.ReactNode; title: string }> = {
  cgu: { icon: <Landmark size={15} className="text-primary" />, title: 'CGU — Portal da Transparência' },
  pep: { icon: <UserCheck size={15} className="text-primary" />, title: 'PEP — Pessoas Expostas Politicamente' },
  pgfn: { icon: <Landmark size={15} className="text-primary" />, title: 'PGFN — Dívida Ativa da União' },
  cndt: { icon: <Scale size={15} className="text-primary" />, title: 'CNDT — Débitos Trabalhistas (TST)' },
  addressValidation: { icon: <MapPin size={15} className="text-primary" />, title: 'Validação de Endereço' },
  sanctions: { icon: <Globe size={15} className="text-primary" />, title: 'Sanções Internacionais (OFAC/UN)' },
  slaveLaborCheck: { icon: <AlertTriangle size={15} className="text-primary" />, title: 'Lista de Trabalho Escravo (MTE)' },
  negativeMedia: { icon: <Search size={15} className="text-primary" />, title: 'Mídia Negativa — OSINT' },
  digitalPresence: { icon: <Monitor size={15} className="text-primary" />, title: 'Presença Digital' },
};

function ComplianceCheckOrPending({ name, hasData, pendingChecks, children }: Readonly<{
  name: ComplianceCheckName;
  hasData: boolean;
  pendingChecks: ComplianceCheckName[];
  children: React.ReactNode;
}>) {
  if (hasData) return <>{children}</>;
  if (pendingChecks.includes(name)) return <PendingCheckCard {...PENDING_CHECK_LABELS[name]} />;
  return null;
}

function PgfnCheckCard({ pgfn, viewRaw, toggleRaw }: Readonly<{
  pgfn: NonNullable<ComplianceResults['pgfn']>;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const pgfnTotal = pgfn.totalDebtAmount ? formatCurrency(String(pgfn.totalDebtAmount)) : 'N/I';
  const pgfnDetail = pgfn.hasDebt ? `${pgfn.debtCount} dívida(s) — Total: ${pgfnTotal}` : null;

  return (
    <ComplianceSubCard
      icon={<Landmark size={15} className="text-primary" />}
      title="PGFN — Dívida Ativa da União"
      badge={<StatusBadge value={pgfn.hasDebt ? 'Devedor' : 'Nada consta'} type={pgfn.hasDebt ? 'danger' : 'success'} />}
    >
      <CheckRow
        label="Lista de Devedores"
        icon={<AlertTriangle size={13} className={pgfn.hasDebt ? 'text-destructive' : 'text-emerald-600'} />}
        hasMatch={pgfn.hasDebt}
        detail={pgfnDetail}
        queriedAt={pgfn.queriedAt}
        rawData={pgfn.rawData}
        viewRaw={viewRaw['pgfn']}
        onToggleRaw={() => toggleRaw('pgfn')}
      />
    </ComplianceSubCard>
  );
}

function SlaveLaborCard({ check, viewRaw, toggleRaw }: Readonly<{
  check: NonNullable<ComplianceResults['slaveLaborCheck']>;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const detail = check.hasMatch
    ? `${check.employerName} — ${check.rescuedWorkers || 0} trabalhador(es) resgatado(s)`
    : null;

  return (
    <ComplianceSubCard
      icon={<AlertTriangle size={15} className="text-primary" />}
      title="Lista de Trabalho Escravo (MTE)"
      badge={<StatusBadge value={check.hasMatch ? 'Encontrado' : 'Nada consta'} type={check.hasMatch ? 'danger' : 'success'} />}
    >
      <CheckRow
        label="Cadastro de Empregadores"
        icon={<AlertTriangle size={13} className={check.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
        hasMatch={check.hasMatch}
        detail={detail}
        queriedAt={check.queriedAt}
        rawData={check.rawData}
        viewRaw={viewRaw['slave-labor']}
        onToggleRaw={() => toggleRaw('slave-labor')}
      />
    </ComplianceSubCard>
  );
}

function ComplianceSection({ clientId, compliance, viewRaw, toggleRaw, pendingChecks }: Readonly<{
  clientId: string;
  compliance: ComplianceResults;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  pendingChecks: ComplianceCheckName[];
}>) {
  const hasCguData = !!(compliance.cgu.ceis.queriedAt || compliance.cgu.cnep.queriedAt || compliance.cgu.cepim.queriedAt);

  return (
    <div className="px-8 pb-8 space-y-3">
      <ComplianceCheckOrPending name="cgu" hasData={hasCguData} pendingChecks={pendingChecks}>
        <CguSubCard cgu={compliance.cgu} viewRaw={viewRaw} toggleRaw={toggleRaw} />
      </ComplianceCheckOrPending>

      {compliance.pep.length > 0 && (
        <ComplianceSubCard
          icon={<UserCheck size={15} className="text-primary" />}
          title="PEP — Pessoas Expostas Politicamente"
          badge={<StatusBadge value={compliance.pep.some((p) => p.hasMatch) ? 'Encontrado' : 'Nada consta'} type={compliance.pep.some((p) => p.hasMatch) ? 'danger' : 'success'} />}
        >
          <div className="space-y-3">
            {compliance.pep.map((p) => (
              <CheckRow
                key={`pep-${p.cpf}`}
                label={p.personName || formatCpf(p.cpf)}
                icon={<Users size={13} className={p.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
                hasMatch={p.hasMatch}
                detail={p.hasMatch ? `${p.matchedRole} — ${p.matchedOrg}` : null}
                queriedAt={p.queriedAt}
                rawData={p.rawData}
                viewRaw={viewRaw[`pep-${p.cpf}`]}
                onToggleRaw={() => toggleRaw(`pep-${p.cpf}`)}
              />
            ))}
          </div>
        </ComplianceSubCard>
      )}

      <ComplianceCheckOrPending name="pgfn" hasData={!!compliance.pgfn} pendingChecks={pendingChecks}>
        {compliance.pgfn && <PgfnCheckCard pgfn={compliance.pgfn} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
      </ComplianceCheckOrPending>

      <ComplianceCheckOrPending name="cndt" hasData={!!compliance.cndt} pendingChecks={pendingChecks}>
        {compliance.cndt && (
          <ComplianceSubCard
            icon={<Scale size={15} className="text-primary" />}
            title="CNDT — Débitos Trabalhistas (TST)"
            badge={<CndtBadge status={compliance.cndt.certificateStatus} />}
          >
            <CndtStatusContent cndt={compliance.cndt} />
          </ComplianceSubCard>
        )}
      </ComplianceCheckOrPending>

      <ComplianceCheckOrPending name="sanctions" hasData={compliance.sanctions.length > 0} pendingChecks={pendingChecks}>
        <SanctionsSubCard sanctions={compliance.sanctions} viewRaw={viewRaw} toggleRaw={toggleRaw} />
      </ComplianceCheckOrPending>

      <ComplianceCheckOrPending name="slaveLaborCheck" hasData={!!compliance.slaveLaborCheck} pendingChecks={pendingChecks}>
        {compliance.slaveLaborCheck && <SlaveLaborCard check={compliance.slaveLaborCheck} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
      </ComplianceCheckOrPending>

      <ComplianceCheckOrPending name="negativeMedia" hasData={compliance.negativeMedia.length > 0} pendingChecks={pendingChecks}>
        <ComplianceSubCard
          icon={<Search size={15} className="text-primary" />}
          title="Mídia Negativa — OSINT"
          badge={compliance.negativeMedia.length > 0 ? <MediaRiskBadge level={compliance.negativeMedia[0]?.riskLevel ?? 'CLEAR'} /> : undefined}
          defaultOpen={compliance.negativeMedia[0]?.riskLevel === 'HIGH' || compliance.negativeMedia[0]?.riskLevel === 'MEDIUM'}
        >
          <NegativeMediaSection clientId={clientId} initialSearches={compliance.negativeMedia} />
        </ComplianceSubCard>
      </ComplianceCheckOrPending>

      <ComplianceCheckOrPending name="digitalPresence" hasData={!!compliance.digitalPresence} pendingChecks={pendingChecks}>
        {compliance.digitalPresence && (
          <ComplianceSubCard
            icon={<Monitor size={15} className="text-primary" />}
            title="Presença Digital"
            badge={<DigitalPresenceBadge digitalPresence={compliance.digitalPresence} />}
          >
            <DigitalPresenceSection digitalPresence={compliance.digitalPresence} />
          </ComplianceSubCard>
        )}
      </ComplianceCheckOrPending>
    </div>
  );
}

function useCompliancePolling(clientId: string) {
  const [compliance, setCompliance] = useState<ComplianceResults | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  const MAX_ATTEMPTS = 24;
  const POLL_INTERVAL_MS = 5_000;

  const fetchCompliance = useCallback(async () => {
    try {
      const res = await api.get<ComplianceResults>(
        `/clients/${clientId}/credit-analysis/compliance-results`,
      );
      return res.data ?? null;
    } catch {
      return null;
    }
  }, [clientId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    attemptsRef.current = 0;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      const data = await fetchCompliance();

      if (data) {
        setCompliance(data);
        if (data.pendingChecks.length === 0 || attemptsRef.current >= MAX_ATTEMPTS) {
          stopPolling();
        }
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }, [fetchCompliance, stopPolling]);

  const load = useCallback(async () => {
    const data = await fetchCompliance();
    setCompliance(data);

    if (data && data.pendingChecks.length > 0) {
      startPolling();
    }

    return data;
  }, [fetchCompliance, startPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { compliance, setCompliance, isPolling, load, startPolling, stopPolling };
}

export function ClientCreditAnalysisTab({ clientId }: Readonly<{ clientId: string }>) {
  const [data, setData] = useState<VaduResultsOutput | null>(null);
  const [creditbox, setCreditbox] = useState<CreditboxReport | null>(null);
  const [serasa, setSerasa] = useState<SerasaReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState<Record<string, boolean>>({});
  
  const [isRequestingCreditbox, setIsRequestingCreditbox] = useState(false);
  const [isRequestingSerasa, setIsRequestingSerasa] = useState(false);
  const [vaduExpanded, setVaduExpanded] = useState(false);
  const [serasaExpanded, setSerasaExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const creditboxPollingRef = useRef<NodeJS.Timeout | null>(null);

  const {
    compliance,
    isPolling: isCompliancePolling,
    load: loadCompliance,
  } = useCompliancePolling(clientId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaduRes, cbRes, , serasaRes] = await Promise.all([
        api.get<VaduResultsOutput>(`/clients/${clientId}/credit-analysis/vadu-results`),
        api.get<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`),
        loadCompliance(),
        api.get<SerasaReportData>(`/clients/${clientId}/credit-analysis/serasa`).catch(() => ({ data: null })),
      ]);
      setData(vaduRes.data || { company: null, persons: [] });
      setCreditbox(cbRes.data || null);
      setSerasa(serasaRes.data || null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar análise de crédito';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clientId, loadCompliance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pollCreditbox = useCallback(async () => {
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox/sync`);
      if (res.data) {
        setCreditbox(res.data);
        if (res.data.status === 'COMPLETED' || res.data.status === 'ERROR') {
          if (creditboxPollingRef.current) clearInterval(creditboxPollingRef.current);
          if (res.data.status === 'COMPLETED') toast.success('Relatório CreditBox gerado com sucesso!');
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error polling CreditBox', err);
    }
  }, [clientId]);

  useEffect(() => {
    if (creditbox && (creditbox.status === 'PENDING' || creditbox.status === 'PROCESSING')) {
      if (!creditboxPollingRef.current) {
        creditboxPollingRef.current = setInterval(pollCreditbox, 5000);
      }
    } else if (creditboxPollingRef.current) {
      clearInterval(creditboxPollingRef.current);
      creditboxPollingRef.current = null;
    }

    return () => {
      if (creditboxPollingRef.current) clearInterval(creditboxPollingRef.current);
    };
  }, [creditbox?.status, pollCreditbox]);

  const handleRequestSerasa = async () => {
    setIsRequestingSerasa(true);
    try {
      const res = await api.post<SerasaReportData>(`/clients/${clientId}/credit-analysis/serasa`);
      setSerasa(res.data);
      if (res.data?.statusCode && res.data.statusCode >= 400) {
        toast.error(res.data.errorMessage || 'Erro na consulta Serasa.');
      } else {
        toast.success('Consulta Serasa realizada com sucesso.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar consulta Serasa';
      toast.error(message);
    } finally {
      setIsRequestingSerasa(false);
    }
  };

  const handleRequestCreditbox = async () => {
    setIsRequestingCreditbox(true);
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`);
      setCreditbox(res.data);
      if (res.data?.status === 'ERROR') {
        toast.error(res.data.errorMessage || 'Erro ao iniciar geração do relatório.');
      } else {
        toast.success('Geração do relatório iniciada.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao solicitar relatório CreditBox';
      toast.error(message);
    } finally {
      setIsRequestingCreditbox(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!creditbox?.pdfBase64) return;
    try {
      const linkSource = `data:application/pdf;base64,${creditbox.pdfBase64}`;
      const downloadLink = document.createElement('a');
      const fileName = `creditbox_${clientId}_${formatDate(creditbox.completedAt).replaceAll('/', '-')}.pdf`;

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    } catch {
      toast.error('Erro ao fazer download do PDF.');
    }
  };

  const toggleRaw = (id: string) => {
    setViewRaw(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <XCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data || (!data.company && data.persons.length === 0 && !compliance && !serasa)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nenhuma análise de crédito encontrada para este cliente.
        </p>
        <p className="text-xs text-muted-foreground">
          A análise será solicitada automaticamente no envio dos documentos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
    {/* Serasa Card */}
    <Card className="overflow-hidden">
      <ExpandableHeader
        icon={<Search size={15} className="text-primary" />}
        title="Serasa Experian"
        subtitle="Relatório Avançado PJ"
        badge={serasa?.rawResponse?.optionalFeatures?.score?.score != null
          ? <SerasaScoreBadge score={Number(serasa.rawResponse.optionalFeatures.score.score)} />
          : undefined}
        isOpen={serasaExpanded}
        onToggle={() => setSerasaExpanded((v) => !v)}
      />
      <ExpandableContent isOpen={serasaExpanded}>
        <SerasaSection
          report={serasa}
          isRequesting={isRequestingSerasa}
          onRequest={handleRequestSerasa}
          viewRaw={viewRaw}
          toggleRaw={toggleRaw}
        />
      </ExpandableContent>
    </Card>

    {/* VADU Card */}
    <Card className="overflow-hidden">
      <ExpandableHeader
        icon={<Shield size={15} className="text-primary" />}
        title="VADU"
        subtitle="Bureau de Crédito"
        isOpen={vaduExpanded}
        onToggle={() => setVaduExpanded((v) => !v)}
      />
      <ExpandableContent isOpen={vaduExpanded}>
        <VaduSection
          data={data}
          creditbox={creditbox}
          viewRaw={viewRaw}
          toggleRaw={toggleRaw}
          isRequestingCreditbox={isRequestingCreditbox}
          handleRequestCreditbox={handleRequestCreditbox}
          handleDownloadPdf={handleDownloadPdf}
        />
      </ExpandableContent>
    </Card>

    {/* Compliance Card */}
    {compliance && (
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Scale size={15} className="text-primary" />}
          title="Compliance"
          subtitle="Consultas Gratuitas"
          badge={
            isCompliancePolling
              ? <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5 animate-pulse">Processando...</Badge>
              : <RiskBadge level={compliance.overallRisk} />
          }
          isOpen={complianceExpanded}
          onToggle={() => setComplianceExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={complianceExpanded}>
          <ComplianceSection
            clientId={clientId}
            compliance={compliance}
            viewRaw={viewRaw}
            toggleRaw={toggleRaw}
            pendingChecks={compliance.pendingChecks}
          />
        </ExpandableContent>
      </Card>
    )}

    {/* Address Validation Card */}
    {compliance?.addressValidation && (
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<MapPin size={15} className="text-primary" />}
          title="Validação de Endereço"
          subtitle="ViaCEP"
          badge={<AddressValidationBadge addressValidation={compliance.addressValidation} />}
          isOpen={addressExpanded}
          onToggle={() => setAddressExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={addressExpanded}>
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="CEP" value={compliance.addressValidation.cep} />
              <InfoField label="Logradouro" value={compliance.addressValidation.street} />
              <InfoField label="Bairro" value={compliance.addressValidation.neighborhood} />
              <InfoField label="Cidade" value={compliance.addressValidation.city} />
              <InfoField label="UF" value={compliance.addressValidation.state} />
              <InfoField label="Consultado em" value={formatDate(compliance.addressValidation.queriedAt)} />
            </div>
          </div>
        </ExpandableContent>
      </Card>
    )}

    </div>
  );
}

function MediaRiskBadge({ level }: Readonly<{ level: string }>) {
  const map: Record<string, { label: string; type: BadgeType }> = {
    HIGH: { label: 'Alto Risco', type: 'danger' },
    MEDIUM: { label: 'Risco Médio', type: 'warning' },
    LOW: { label: 'Risco Baixo', type: 'success' },
    CLEAR: { label: 'Sem Menções', type: 'success' },
  };
  const c = map[level] ?? { label: level, type: 'neutral' as BadgeType };
  return <StatusBadge value={c.label} type={c.type} />;
}

function FindingCategoryBadge({ category }: Readonly<{ category: string }>) {
  const map: Record<string, { label: string; type: BadgeType }> = {
    fraude: { label: 'Fraude', type: 'danger' },
    golpe: { label: 'Golpe', type: 'danger' },
    recuperacao_judicial: { label: 'Recuperação Judicial', type: 'warning' },
    trabalho_escravo: { label: 'Trabalho Escravo', type: 'danger' },
    multa_ambiental: { label: 'Multa Ambiental', type: 'warning' },
    processo_criminal: { label: 'Processo Criminal', type: 'danger' },
    outro: { label: 'Outro', type: 'neutral' },
  };
  const c = map[category] ?? { label: category, type: 'neutral' as BadgeType };
  return <StatusBadge value={c.label} type={c.type} />;
}

type NegativeMediaSearch = ComplianceResults['negativeMedia'][number];

function NegativeMediaSection({ clientId, initialSearches }: Readonly<{ clientId: string; initialSearches: ComplianceResults['negativeMedia'] }>) {
  const [searches, setSearches] = useState<NegativeMediaSearch[]>(initialSearches);
  const [searching, setSearching] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = initialSearches[0];
    return first ? new Set([first.id]) : new Set();
  });

  useEffect(() => {
    setSearches(initialSearches);
  }, [initialSearches]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewSearch = async () => {
    setSearching(true);
    try {
      const res = await api.post<NegativeMediaSearch>(`/clients/${clientId}/credit-analysis/negative-media/search`);
      if (res.data) {
        setSearches((prev) => [res.data!, ...prev]);
        setExpanded((prev) => new Set([res.data!.id, ...prev]));
        toast.success('Busca de mídia negativa concluída.');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao realizar busca de mídia negativa';
      toast.error(message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="px-8 pb-8 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Histórico de Buscas ({searches.length})</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewSearch}
          disabled={searching}
          className="h-7 px-3 text-xs"
        >
          {searching ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <RefreshCw size={12} className="mr-1.5" />}
          Nova Busca
        </Button>
      </div>

      {searches.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma busca realizada ainda.</p>
      )}

      {searches.map((search) => (
        <Card key={search.id} className="overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2.5 cursor-pointer text-left bg-gradient-to-r from-primary/5 to-transparent"
            onClick={() => toggleExpanded(search.id)}
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-primary" />
              <span className="text-xs font-medium">{formatDate(search.queriedAt)}</span>
              <MediaRiskBadge level={search.riskLevel} />
              <span className="text-[10px] text-muted-foreground">
                {search.findingsCount} {search.findingsCount === 1 ? 'achado' : 'achados'}
              </span>
            </div>
            <RotatingChevron isOpen={expanded.has(search.id)} className="text-muted-foreground" />
          </button>
          <ExpandableContent isOpen={expanded.has(search.id)}>
            <NegativeMediaSearchDetail search={search} />
          </ExpandableContent>
        </Card>
      ))}
    </div>
  );
}

function NegativeMediaSearchDetail({ search }: Readonly<{ search: NegativeMediaSearch }>) {
  return (
    <div className="px-4 pb-4 pt-2 space-y-4">
      {search.summary && (
        <p className="text-sm text-muted-foreground">{search.summary}</p>
      )}

      {search.findings.length > 0 && (
        <div className="space-y-3">
          {search.findings.map((finding, idx) => (
            <Card key={`finding-${finding.sourceUrl ?? idx}`} className="overflow-hidden border-muted">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FindingCategoryBadge category={finding.category} />
                      {finding.date && (
                        <span className="text-[10px] text-muted-foreground">{finding.date}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">{finding.snippet}</p>
                  </div>
                  {finding.sourceUrl && (
                    <a
                      href={finding.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-primary hover:text-primary/80"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                {finding.sourceName && (
                  <p className="text-[10px] text-muted-foreground">Fonte: {finding.sourceName}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {search.findings.length === 0 && search.riskLevel === 'CLEAR' && (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 size={14} />
          <span className="text-sm">Nenhuma menção negativa encontrada na internet.</span>
        </div>
      )}

      {search.groundingSources.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Fontes consultadas</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {search.groundingSources.map((source, idx) => (
              <a
                key={`source-${source.uri}`}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink size={10} />
                {source.title || source.uri}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function resolveEmailTypeLabel(emailType: string): string {
  if (emailType === 'corporate') return 'Corporativo';
  if (emailType === 'free') return 'Gratuito';
  return 'Desconhecido';
}

function resolveEmailTypeColor(emailType: string): BadgeType {
  if (emailType === 'corporate') return 'success';
  if (emailType === 'free') return 'warning';
  return 'neutral';
}

function DigitalPresenceBadge({ digitalPresence }: Readonly<{ digitalPresence: NonNullable<ComplianceResults['digitalPresence']> }>) {
  if (digitalPresence.emailType === 'free') return <StatusBadge value="E-mail Gratuito" type="warning" />;
  if (digitalPresence.hasActiveSite) return <StatusBadge value="Site Ativo" type="success" />;
  return <StatusBadge value="Sem Site" type="neutral" />;
}

function DigitalPresenceSection({ digitalPresence }: Readonly<{ digitalPresence: NonNullable<ComplianceResults['digitalPresence']> }>) {
  const emailTypeLabel = resolveEmailTypeLabel(digitalPresence.emailType);
  const emailTypeColor = resolveEmailTypeColor(digitalPresence.emailType);

  return (
    <div className="px-8 pb-8 space-y-5">
      <div className="flex items-center gap-2">
        <Monitor size={15} className="text-primary" />
        <span className="text-sm font-medium">Verificação</span>
        {digitalPresence.queriedAt && (
          <span className="text-[10px] text-muted-foreground">{formatDate(digitalPresence.queriedAt)}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <InfoField label="Domínio" value={digitalPresence.domain} />
        <InfoField label="Tipo de E-mail" valueNode={
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-muted-foreground" />
            <StatusBadge value={emailTypeLabel} type={emailTypeColor} />
          </div>
        } />
        <InfoField label="DNS Resolve" valueNode={
          <StatusBadge
            value={digitalPresence.hasDns ? 'Sim' : 'Não'}
            type={digitalPresence.hasDns ? 'success' : 'danger'}
          />
        } />
        <InfoField label="Site Ativo" valueNode={
          <div className="flex items-center gap-2">
            <StatusBadge
              value={digitalPresence.hasActiveSite ? 'Sim' : 'Não'}
              type={digitalPresence.hasActiveSite ? 'success' : 'danger'}
            />
            {digitalPresence.hasActiveSite && digitalPresence.domain && (
              <a
                href={`https://${digitalPresence.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        } />
        {digitalPresence.siteTitle && (
          <div className="col-span-2">
            <InfoField label="Título do Site" value={digitalPresence.siteTitle} />
          </div>
        )}
      </div>
    </div>
  );
}

function AddressValidationBadge({ addressValidation }: Readonly<{ addressValidation: NonNullable<ComplianceResults['addressValidation']> }>) {
  if (!addressValidation.isValid) return <StatusBadge value="CEP Inválido" type="danger" />;
  if (addressValidation.matchesRegistered === true) return <StatusBadge value="Consistente" type="success" />;
  if (addressValidation.matchesRegistered === false) return <StatusBadge value="Inconsistente" type="warning" />;
  return null;
}
