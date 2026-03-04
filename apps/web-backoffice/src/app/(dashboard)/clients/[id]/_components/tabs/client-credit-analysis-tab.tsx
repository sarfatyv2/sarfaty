'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button, ScrollArea } from '@nexus/ui';
import { FileText, XCircle, Code2, Building2, MapPin, Activity, Leaf, Users, FileBarChart, Loader2, Download, Shield, AlertTriangle, CheckCircle2, Scale, Landmark, Globe, UserCheck, Search, Monitor, Mail, ExternalLink } from 'lucide-react';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ComplianceResults {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';
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
  negativeMedia: {
    riskLevel: string; findingsCount: number;
    findings: Array<{
      category: string; title: string; snippet: string;
      sourceUrl: string | null; sourceName: string | null; date: string | null;
    }>;
    summary: string | null; groundingSources: Array<{ uri: string; title: string }>;
    queriedAt: string | null;
  } | null;
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

function ComplianceSection({ compliance, viewRaw, toggleRaw }: Readonly<{
  compliance: ComplianceResults;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const pgfnTotal = compliance.pgfn?.totalDebtAmount
    ? formatCurrency(String(compliance.pgfn.totalDebtAmount))
    : 'N/I';
  const pgfnDetail = compliance.pgfn?.hasDebt
    ? `${compliance.pgfn.debtCount} dívida(s) — Total: ${pgfnTotal}`
    : null;

  return (
    <div className="px-8 pb-8 space-y-5">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm flex items-center gap-2">
            <Landmark size={15} className="text-primary" />
            CGU — Portal da Transparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CheckRow
            label="CEIS — Empresas Inidôneas"
            icon={<AlertTriangle size={13} className={compliance.cgu.ceis.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
            hasMatch={compliance.cgu.ceis.hasMatch}
            detail={compliance.cgu.ceis.summary}
            queriedAt={compliance.cgu.ceis.queriedAt}
            rawData={compliance.cgu.ceis.rawData}
            viewRaw={viewRaw['cgu-ceis']}
            onToggleRaw={() => toggleRaw('cgu-ceis')}
          />
          <CheckRow
            label="CNEP — Empresas Punidas"
            icon={<AlertTriangle size={13} className={compliance.cgu.cnep.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
            hasMatch={compliance.cgu.cnep.hasMatch}
            detail={compliance.cgu.cnep.summary}
            queriedAt={compliance.cgu.cnep.queriedAt}
            rawData={compliance.cgu.cnep.rawData}
            viewRaw={viewRaw['cgu-cnep']}
            onToggleRaw={() => toggleRaw('cgu-cnep')}
          />
          <CheckRow
            label="CEPIM — Entidades Impedidas"
            icon={<AlertTriangle size={13} className={compliance.cgu.cepim.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
            hasMatch={compliance.cgu.cepim.hasMatch}
            detail={compliance.cgu.cepim.summary}
            queriedAt={compliance.cgu.cepim.queriedAt}
            rawData={compliance.cgu.cepim.rawData}
            viewRaw={viewRaw['cgu-cepim']}
            onToggleRaw={() => toggleRaw('cgu-cepim')}
          />
        </CardContent>
      </Card>

      {compliance.pep.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck size={15} className="text-primary" />
              PEP — Pessoas Expostas Politicamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      )}

      {compliance.pgfn && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark size={15} className="text-primary" />
              PGFN — Dívida Ativa da União
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckRow
              label="Lista de Devedores"
              icon={<AlertTriangle size={13} className={compliance.pgfn.hasDebt ? 'text-destructive' : 'text-emerald-600'} />}
              hasMatch={compliance.pgfn.hasDebt}
              detail={pgfnDetail}
              queriedAt={compliance.pgfn.queriedAt}
              rawData={compliance.pgfn.rawData}
              viewRaw={viewRaw['pgfn']}
              onToggleRaw={() => toggleRaw('pgfn')}
            />
          </CardContent>
        </Card>
      )}

      {compliance.cndt && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale size={15} className="text-primary" />
              CNDT — Débitos Trabalhistas (TST)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CndtStatusContent cndt={compliance.cndt} />
          </CardContent>
        </Card>
      )}

      {compliance.sanctions.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe size={15} className="text-primary" />
              Sanções Internacionais (OFAC/UN)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {compliance.sanctions.map((s) => (
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
          </CardContent>
        </Card>
      )}

      {compliance.slaveLaborCheck && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle size={15} className="text-primary" />
              Lista de Trabalho Escravo (MTE)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckRow
              label="Cadastro de Empregadores"
              icon={<AlertTriangle size={13} className={compliance.slaveLaborCheck.hasMatch ? 'text-destructive' : 'text-emerald-600'} />}
              hasMatch={compliance.slaveLaborCheck.hasMatch}
              detail={compliance.slaveLaborCheck.hasMatch
                ? `${compliance.slaveLaborCheck.employerName} — ${compliance.slaveLaborCheck.rescuedWorkers || 0} trabalhador(es) resgatado(s)`
                : null}
              queriedAt={compliance.slaveLaborCheck.queriedAt}
              rawData={compliance.slaveLaborCheck.rawData}
              viewRaw={viewRaw['slave-labor']}
              onToggleRaw={() => toggleRaw('slave-labor')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ClientCreditAnalysisTab({ clientId }: Readonly<{ clientId: string }>) {
  const [data, setData] = useState<VaduResultsOutput | null>(null);
  const [creditbox, setCreditbox] = useState<CreditboxReport | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState<Record<string, boolean>>({});
  
  const [isRequestingCreditbox, setIsRequestingCreditbox] = useState(false);
  const [vaduExpanded, setVaduExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [negativeMediaExpanded, setNegativeMediaExpanded] = useState(false);
  const [digitalPresenceExpanded, setDigitalPresenceExpanded] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaduRes, cbRes, compRes] = await Promise.all([
        api.get<VaduResultsOutput>(`/clients/${clientId}/credit-analysis/vadu-results`),
        api.get<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox`),
        api.get<ComplianceResults>(`/clients/${clientId}/credit-analysis/compliance-results`).catch(() => ({ data: null })),
      ]);
      setData(vaduRes.data || { company: null, persons: [] });
      setCreditbox(cbRes.data || null);
      setCompliance(compRes.data || null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar análise de crédito';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pollCreditbox = useCallback(async () => {
    try {
      const res = await api.post<CreditboxReport>(`/clients/${clientId}/credit-analysis/creditbox/sync`);
      if (res.data) {
        setCreditbox(res.data);
        if (res.data.status === 'COMPLETED' || res.data.status === 'ERROR') {
          if (pollingRef.current) clearInterval(pollingRef.current);
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
      if (!pollingRef.current) {
        pollingRef.current = setInterval(pollCreditbox, 5000);
      }
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [creditbox?.status, pollCreditbox]);

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

  if (!data || (!data.company && data.persons.length === 0 && !compliance)) {
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
    {compliance && compliance.overallRisk !== 'PENDING' && (
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Scale size={15} className="text-primary" />}
          title="Compliance"
          subtitle="Consultas Gratuitas"
          badge={<RiskBadge level={compliance.overallRisk} />}
          isOpen={complianceExpanded}
          onToggle={() => setComplianceExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={complianceExpanded}>
          <ComplianceSection compliance={compliance} viewRaw={viewRaw} toggleRaw={toggleRaw} />
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

    {/* Negative Media Card */}
    {compliance?.negativeMedia && (
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Search size={15} className="text-primary" />}
          title="Mídia Negativa"
          subtitle="OSINT — Gemini Search"
          badge={<MediaRiskBadge level={compliance.negativeMedia.riskLevel} />}
          isOpen={negativeMediaExpanded}
          onToggle={() => setNegativeMediaExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={negativeMediaExpanded}>
          <NegativeMediaSection negativeMedia={compliance.negativeMedia} />
        </ExpandableContent>
      </Card>
    )}

    {/* Digital Presence Card */}
    {compliance?.digitalPresence && (
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Monitor size={15} className="text-primary" />}
          title="Presença Digital"
          subtitle="DNS + Site + E-mail"
          badge={<DigitalPresenceBadge digitalPresence={compliance.digitalPresence} />}
          isOpen={digitalPresenceExpanded}
          onToggle={() => setDigitalPresenceExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={digitalPresenceExpanded}>
          <DigitalPresenceSection digitalPresence={compliance.digitalPresence} />
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

function NegativeMediaSection({ negativeMedia }: Readonly<{ negativeMedia: NonNullable<ComplianceResults['negativeMedia']> }>) {
  return (
    <div className="px-8 pb-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-primary" />
          <span className="text-sm font-medium">Resultado da Busca</span>
          <MediaRiskBadge level={negativeMedia.riskLevel} />
        </div>
        {negativeMedia.queriedAt && (
          <span className="text-[10px] text-muted-foreground">{formatDate(negativeMedia.queriedAt)}</span>
        )}
      </div>

      {negativeMedia.summary && (
        <Card className="overflow-hidden">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{negativeMedia.summary}</p>
          </CardContent>
        </Card>
      )}

      {negativeMedia.findings.length > 0 && (
        <div className="space-y-3">
          {negativeMedia.findings.map((finding, idx) => (
            <Card key={`finding-${finding.sourceUrl ?? idx}`} className="overflow-hidden">
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

      {negativeMedia.findings.length === 0 && negativeMedia.riskLevel === 'CLEAR' && (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 size={14} />
          <span className="text-sm">Nenhuma menção negativa encontrada na internet.</span>
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
