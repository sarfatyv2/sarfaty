'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button, ScrollArea } from '@nexus/ui';
import { FileText, XCircle, Code2, Building2, MapPin, Activity, Leaf, Users, Landmark, Scale, Globe, AlertTriangle, CheckCircle2, Search, Monitor, Mail, ExternalLink, RefreshCw, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

interface VaduPersonResult {
  id: string;
  cpf: string | null;
  name: string | null;
  birthDate: string | null;
  motherName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduCompanyResult {
  id: string;
  cnpj: string | null;
  companyName: string | null;
  tradeName: string | null;
  revenueStatus: string | null;
  revenueStatusDate: string | null;
  specialStatus: string | null;
  capitalSocial: number | null;
  legalNature: string | null;
  isSimplesNacional: boolean | null;
  companySize: string | null;
  environmentalScore: number | null;
  environmentalLevel: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

interface VaduDraweeResultsOutput {
  company: VaduCompanyResult | null;
  persons: VaduPersonResult[];
}

interface SerasaReportData {
  id: string;
  draweeId: string;
  cnpj: string;
  reportName: string;
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse: any;
  errorMessage: string | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ComplianceDraweeResults {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';
  pendingChecks: string[];
  cgu: { ceis: any; cnep: any; cepim: any };
  pep: Array<{ cpf: string; personName: string | null; hasMatch: boolean; matchedRole: string | null; matchedOrg: string | null; rawData: any; queriedAt: string }>;
  pgfn: { hasDebt: boolean; totalDebtAmount: number | null; debtCount: number; summary: string | null; rawData: any; queriedAt: string } | null;
  cndt: { certificateStatus: string; certificateNumber: string | null; validUntil: string | null; rawData: any; queriedAt: string } | null;
  addressValidation: { cep: string | null; isValid: boolean; street: string | null; neighborhood: string | null; city: string | null; state: string | null; matchesRegistered: boolean | null; rawData: any; queriedAt: string } | null;
  sanctions: Array<{ entityName: string | null; source: string; hasMatch: boolean; matchScore: number | null; matchDetails: string | null; rawData: any; queriedAt: string }>;
  slaveLaborCheck: { hasMatch: boolean; employerName: string | null; rescuedWorkers: number | null; inspectionDate: string | null; rawData: any; queriedAt: string } | null;
  negativeMedia: Array<{ id: string; riskLevel: string; findingsCount: number; findings: Array<Record<string, unknown>>; summary: string | null; groundingSources: Array<{ uri: string; title: string }>; queriedAt: string }>;
  digitalPresence: { domain: string | null; emailType: string; hasDns: boolean; hasActiveSite: boolean; siteTitle: string | null; queriedAt: string | null } | null;
}

function formatCpf(cpf: string): string {
  const digits = cpf.replaceAll(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replaceAll(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/g, '$1.$2.$3/$4-$5');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(value: string | number | null): string {
  if (value == null) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function InfoField({ label, value, valueNode }: { label: string; value?: string | null | boolean | number; valueNode?: React.ReactNode }) {
  const display = valueNode ?? (value ?? '—');
  if (typeof value === 'boolean') return <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="text-sm">{value ? 'Sim' : 'Não'}</p></div>;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {valueNode ? <div>{valueNode}</div> : <p className="text-sm font-medium">{display}</p>}
    </div>
  );
}

function StatusBadge({ value, type }: { value: string | null | undefined; type: BadgeType }) {
  if (!value) return <span className="text-sm">—</span>;
  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700', danger: 'bg-red-100 text-red-700', warning: 'bg-amber-100 text-amber-700', neutral: 'bg-slate-100 text-slate-700',
  };
  return <Badge className={`${colors[type]} font-semibold`}>{value}</Badge>;
}

function RiskBadge({ level }: { level: ComplianceDraweeResults['overallRisk'] }) {
  const config: Record<string, { label: string; type: BadgeType }> = {
    CRITICAL: { label: 'Risco Crítico', type: 'danger' }, HIGH: { label: 'Risco Alto', type: 'danger' },
    MEDIUM: { label: 'Risco Médio', type: 'warning' }, LOW: { label: 'Risco Baixo', type: 'success' },
    CLEAR: { label: 'Sem Restrições', type: 'success' }, PENDING: { label: 'Pendente', type: 'neutral' },
  };
  const c = config[level] ?? { label: level, type: 'neutral' as BadgeType };
  return <StatusBadge value={c.label} type={c.type} />;
}

function ExpandableHeader({ icon, title, subtitle, badge, isOpen, onToggle }: { icon: React.ReactNode; title: string; subtitle?: string; badge?: React.ReactNode; isOpen: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="flex w-full items-center justify-between px-8 py-5 cursor-pointer text-left" onClick={onToggle}>
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

interface DraweeCreditAnalysisTabProps {
  draweeId: string;
}

export function DraweeCreditAnalysisTab({ draweeId }: DraweeCreditAnalysisTabProps) {
  const [vadu, setVadu] = useState<VaduDraweeResultsOutput | null>(null);
  const [serasa, setSerasa] = useState<SerasaReportData | null>(null);
  const [compliance, setCompliance] = useState<ComplianceDraweeResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState<Record<string, boolean>>({});
  const [isRequestingSerasa, setIsRequestingSerasa] = useState(false);
  const [vaduExpanded, setVaduExpanded] = useState(false);
  const [serasaExpanded, setSerasaExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCompliance = useCallback(async () => {
    try {
      const res = await api.get<ComplianceDraweeResults>(`/drawees/${draweeId}/credit-analysis/compliance-results`);
      return res.data ?? null;
    } catch {
      return null;
    }
  }, [draweeId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vaduRes, serasaRes, compRes] = await Promise.all([
        api.get<VaduDraweeResultsOutput>(`/drawees/${draweeId}/credit-analysis/vadu-results`),
        api.get<SerasaReportData>(`/drawees/${draweeId}/credit-analysis/serasa`).catch(() => ({ data: null })),
        fetchCompliance(),
      ]);
      setVadu(vaduRes.data ?? { company: null, persons: [] });
      setSerasa(serasaRes.data || null);
      setCompliance(compRes);

      if (compRes?.pendingChecks?.length) {
        setIsPolling(true);
        const id = setInterval(async () => {
          const data = await fetchCompliance();
          if (data) {
            setCompliance(data);
            if (!data.pendingChecks?.length) {
              clearInterval(id);
              setIsPolling(false);
            }
          }
        }, 5000);
        pollingRef.current = id;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  }, [draweeId, fetchCompliance]);

  useEffect(() => {
    loadData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadData]);

  const handleRequestSerasa = async () => {
    setIsRequestingSerasa(true);
    try {
      const res = await api.post<SerasaReportData>(`/drawees/${draweeId}/credit-analysis/serasa`);
      setSerasa(res.data);
      toast.success('Consulta Serasa realizada.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao solicitar Serasa');
    } finally {
      setIsRequestingSerasa(false);
    }
  };

  const handleNegativeMediaSearch = async () => {
    try {
      const res = await api.post<ComplianceDraweeResults['negativeMedia'][number]>(`/drawees/${draweeId}/credit-analysis/negative-media/search`);
      if (res.data && compliance) {
        setCompliance({ ...compliance, negativeMedia: [res.data, ...compliance.negativeMedia] });
        toast.success('Busca de mídia negativa concluída.');
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao buscar mídia negativa');
    }
  };

  const toggleRaw = (id: string) => setViewRaw((p) => ({ ...p, [id]: !p[id] }));

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
        <Button variant="outline" size="sm" onClick={loadData}>Tentar novamente</Button>
      </div>
    );
  }

  const hasAny = vadu?.company || (vadu?.persons?.length ?? 0) > 0 || compliance || serasa;
  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhuma análise de crédito encontrada.</p>
        <p className="text-xs text-muted-foreground">A análise é disparada automaticamente na criação do sacado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Serasa */}
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Search size={15} className="text-primary" />}
          title="Serasa Experian"
          subtitle="Relatório Avançado PJ"
          badge={serasa?.rawResponse?.optionalFeatures?.score?.score != null ? (
            <StatusBadge value={serasa.rawResponse.optionalFeatures.score.score >= 700 ? 'Baixo Risco' : serasa.rawResponse.optionalFeatures.score.score >= 400 ? 'Médio Risco' : 'Alto Risco'} type={serasa.rawResponse.optionalFeatures.score.score >= 700 ? 'success' : serasa.rawResponse.optionalFeatures.score.score >= 400 ? 'warning' : 'danger'} />
          ) : undefined}
          isOpen={serasaExpanded}
          onToggle={() => setSerasaExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={serasaExpanded}>
          <div className="px-8 pb-8">
            {!serasa ? (
              <div className="flex flex-col items-center py-8 space-y-3">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhuma consulta Serasa realizada.</p>
                <Button onClick={handleRequestSerasa} disabled={isRequestingSerasa} size="sm" className="gap-1.5">
                  {isRequestingSerasa ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                  Consultar Serasa
                </Button>
              </div>
            ) : serasa.statusCode >= 400 ? (
              <div className="flex flex-col items-center py-6 space-y-2">
                <XCircle className="h-6 w-6 text-destructive/60" />
                <p className="text-sm text-destructive">{serasa.errorMessage || `Erro HTTP ${serasa.statusCode}`}</p>
                <Button variant="outline" size="sm" onClick={handleRequestSerasa} disabled={isRequestingSerasa}>
                  {isRequestingSerasa ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Consultado em {formatDate(serasa.createdAt)}</span>
                  <Button onClick={handleRequestSerasa} disabled={isRequestingSerasa} variant="outline" size="sm">
                    {isRequestingSerasa ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Nova Consulta
                  </Button>
                </div>
                {serasa.rawResponse && (
                  <div className="grid grid-cols-2 gap-4">
                    {serasa.rawResponse?.optionalFeatures?.score?.score != null && (
                      <Card><CardContent className="pt-4"><InfoField label="Score" value={String(serasa.rawResponse.optionalFeatures.score.score)} /></CardContent></Card>
                    )}
                    {serasa.rawResponse?.optionalFeatures?.scores?.scoreResponse?.[0]?.score != null && (
                      <Card><CardContent className="pt-4"><InfoField label="Limite Crédito" value={formatCurrency(serasa.rawResponse.optionalFeatures.scores.scoreResponse[0].score)} /></CardContent></Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ExpandableContent>
      </Card>

      {/* VADU */}
      <Card className="overflow-hidden">
        <ExpandableHeader
          icon={<Shield size={15} className="text-primary" />}
          title="VADU"
          subtitle="Bureau de Crédito"
          isOpen={vaduExpanded}
          onToggle={() => setVaduExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={vaduExpanded}>
          <div className="px-8 pb-8 space-y-6">
            {vadu?.company && (
              <Card>
                <CardHeader className="pb-4"><CardTitle className="text-sm">Empresa</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField label="CNPJ" value={formatCnpj(vadu.company.cnpj)} />
                    <InfoField label="Razão Social" value={vadu.company.companyName} />
                    <InfoField label="Situação" value={vadu.company.revenueStatus} />
                    <InfoField label="Consultado em" value={formatDate(vadu.company.queriedAt)} />
                  </div>
                </CardContent>
              </Card>
            )}
            {vadu?.persons && vadu.persons.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2"><Users size={15} className="text-primary" /> Pessoa Física</p>
                {vadu.persons.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <InfoField label="CPF" value={formatCpf(p.cpf ?? '')} />
                        <InfoField label="Nome" value={p.name} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ExpandableContent>
      </Card>

      {/* Compliance */}
      {compliance && (
        <Card className="overflow-hidden">
          <ExpandableHeader
            icon={<Scale size={15} className="text-primary" />}
            title="Compliance"
            subtitle="Consultas Gratuitas"
            badge={isPolling ? <Badge className="bg-blue-100 text-blue-700 animate-pulse">Processando...</Badge> : <RiskBadge level={compliance.overallRisk} />}
            isOpen={complianceExpanded}
            onToggle={() => setComplianceExpanded((v) => !v)}
          />
          <ExpandableContent isOpen={complianceExpanded}>
            <div className="px-8 pb-8 space-y-4">
              {compliance.cgu && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">CGU</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <InfoField label="CEIS" value={compliance.cgu.ceis?.hasMatch ? 'Encontrado' : 'Nada consta'} />
                      <InfoField label="CNEP" value={compliance.cgu.cnep?.hasMatch ? 'Encontrado' : 'Nada consta'} />
                      <InfoField label="CEPIM" value={compliance.cgu.cepim?.hasMatch ? 'Encontrado' : 'Nada consta'} />
                    </div>
                  </CardContent>
                </Card>
              )}
              {compliance.pgfn && (
                <Card>
                  <CardContent className="pt-4">
                    <InfoField label="PGFN" value={compliance.pgfn.hasDebt ? `Devedor (${compliance.pgfn.debtCount} dívidas)` : 'Nada consta'} />
                  </CardContent>
                </Card>
              )}
              {compliance.sanctions?.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    {compliance.sanctions.some((s) => s.hasMatch) ? <StatusBadge value="Encontrado" type="danger" /> : <StatusBadge value="Nada consta" type="success" />}
                  </CardContent>
                </Card>
              )}
              {compliance.negativeMedia.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">Mídia Negativa</CardTitle>
                    <Button size="sm" variant="outline" onClick={handleNegativeMediaSearch} className="gap-1">
                      <RefreshCw size={12} /> Nova Busca
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {compliance.negativeMedia.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center gap-2 py-1">
                        <span className="text-xs">{formatDate(m.queriedAt)}</span>
                        <StatusBadge value={m.riskLevel} type={m.riskLevel === 'HIGH' ? 'danger' : m.riskLevel === 'MEDIUM' ? 'warning' : 'success'} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ExpandableContent>
        </Card>
      )}
    </div>
  );
}
