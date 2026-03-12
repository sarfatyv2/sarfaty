'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button } from '@nexus/ui';
import { FileText, XCircle, MapPin, Users, Shield, Scale, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent } from '@/app/(dashboard)/clients/[id]/_components/motion-wrapper';
import {
  SerasaSection,
  SerasaScoreBadge,
  ComplianceSection,
  RiskBadge,
  ExpandableHeader,
} from '@/app/(dashboard)/clients/[id]/_components/tabs/client-credit-analysis-tab';
import { AllcheckSection } from '@/app/(dashboard)/clients/[id]/_components/tabs/allcheck-section';

function AddressValidationBadge({ addressValidation }: { addressValidation: { isValid: boolean; matchesRegistered: boolean | null } }) {
  if (!addressValidation.isValid) return <Badge className="bg-red-100 text-red-700 font-semibold px-2.5 py-0.5">CEP Inválido</Badge>;
  if (addressValidation.matchesRegistered === true) return <Badge className="bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5">Consistente</Badge>;
  if (addressValidation.matchesRegistered === false) return <Badge className="bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5">Inconsistente</Badge>;
  return null;
}

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
  const [addressExpanded, setAddressExpanded] = useState(false);
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
            <SerasaScoreBadge score={Number(serasa.rawResponse.optionalFeatures.score.score)} />
          ) : undefined}
          isOpen={serasaExpanded}
          onToggle={() => setSerasaExpanded((v) => !v)}
        />
        <ExpandableContent isOpen={serasaExpanded}>
          <SerasaSection
            report={serasa as Parameters<typeof SerasaSection>[0]['report']}
            isRequesting={isRequestingSerasa}
            onRequest={handleRequestSerasa}
            viewRaw={viewRaw}
            toggleRaw={toggleRaw}
          />
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
            badge={isPolling ? <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5 animate-pulse">Processando...</Badge> : <RiskBadge level={compliance.overallRisk} />}
            isOpen={complianceExpanded}
            onToggle={() => setComplianceExpanded((v) => !v)}
          />
          <ExpandableContent isOpen={complianceExpanded}>
            <ComplianceSection
              draweeId={draweeId}
              compliance={compliance as Parameters<typeof ComplianceSection>[0]['compliance']}
              viewRaw={viewRaw}
              toggleRaw={toggleRaw}
              pendingChecks={compliance.pendingChecks as Parameters<typeof ComplianceSection>[0]['pendingChecks']}
            />
          </ExpandableContent>
        </Card>
      )}

      {/* Address Validation */}
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
                <InfoField label="Consultado em" value={compliance.addressValidation.queriedAt ? formatDate(compliance.addressValidation.queriedAt) : undefined} />
              </div>
            </div>
          </ExpandableContent>
        </Card>
      )}

      {/* Allcheck Localizador */}
      <AllcheckSection entityId={draweeId} entityType="drawee" />
    </div>
  );
}
