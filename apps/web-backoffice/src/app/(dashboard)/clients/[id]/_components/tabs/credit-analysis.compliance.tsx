'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, Button, Badge } from '@nexus/ui';
import {
  Landmark, AlertTriangle, Scale, Users, Globe, Search,
  Monitor, Mail, ExternalLink, RefreshCw, Loader2, CheckCircle2, UserCheck, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';
import type { ComplianceResults, ComplianceCheckName, BadgeType } from './credit-analysis.types';
import { formatDate, formatCpf } from './credit-analysis.utils';
import { StatusBadge, InfoField, ComplianceSubCard, CheckRow } from './credit-analysis.ui';

// ─── RiskBadge (exported) ─────────────────────────────────────────────────────

export function RiskBadge({ level }: Readonly<{ level: ComplianceResults['overallRisk'] }>) {
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

// ─── AddressValidationBadge ───────────────────────────────────────────────────

export function AddressValidationBadge({ addressValidation }: Readonly<{
  addressValidation: NonNullable<ComplianceResults['addressValidation']>;
}>) {
  if (!addressValidation.isValid) return <StatusBadge value="CEP Inválido" type="danger" />;
  if (addressValidation.matchesRegistered === true) return <StatusBadge value="Consistente" type="success" />;
  if (addressValidation.matchesRegistered === false) return <StatusBadge value="Inconsistente" type="warning" />;
  return null;
}

// ─── CGU Sub-card ─────────────────────────────────────────────────────────────

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

// ─── Sanctions Sub-card ───────────────────────────────────────────────────────

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

// ─── PGFN card ────────────────────────────────────────────────────────────────

function PgfnCheckCard({ pgfn, viewRaw, toggleRaw }: Readonly<{
  pgfn: NonNullable<ComplianceResults['pgfn']>;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
}>) {
  const formatCurrency = (v: string) => {
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
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

// ─── Slave labor card ─────────────────────────────────────────────────────────

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

// ─── CNDT ─────────────────────────────────────────────────────────────────────

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

// ─── Negative Media ───────────────────────────────────────────────────────────

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
            {search.groundingSources.map((source) => (
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

function NegativeMediaSection({ initialSearches, onNewSearch: onNewSearchProp, clientId: clientIdProp, draweeId }: Readonly<{
  initialSearches: ComplianceResults['negativeMedia'];
  onNewSearch?: () => Promise<NegativeMediaSearch | null>;
  clientId?: string;
  draweeId?: string;
}>) {
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
      let data: NegativeMediaSearch | null = null;
      if (onNewSearchProp) {
        data = await onNewSearchProp();
      } else if (draweeId) {
        const res = await api.post<NegativeMediaSearch>(`/drawees/${draweeId}/credit-analysis/negative-media/search`);
        data = res.data ?? null;
      } else if (clientIdProp) {
        const res = await api.post<NegativeMediaSearch>(`/clients/${clientIdProp}/credit-analysis/negative-media/search`);
        data = res.data ?? null;
      }
      if (data) {
        setSearches((prev) => [data, ...prev]);
        setExpanded((prev) => new Set([data.id, ...prev]));
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
        <Button variant="outline" size="sm" onClick={handleNewSearch} disabled={searching} className="h-7 px-3 text-xs">
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

// ─── Digital Presence ─────────────────────────────────────────────────────────

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

function DigitalPresenceBadge({ digitalPresence }: Readonly<{
  digitalPresence: NonNullable<ComplianceResults['digitalPresence']>;
}>) {
  if (digitalPresence.emailType === 'free') return <StatusBadge value="E-mail Gratuito" type="warning" />;
  if (digitalPresence.hasActiveSite) return <StatusBadge value="Site Ativo" type="success" />;
  return <StatusBadge value="Sem Site" type="neutral" />;
}

function DigitalPresenceSection({ digitalPresence }: Readonly<{
  digitalPresence: NonNullable<ComplianceResults['digitalPresence']>;
}>) {
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

// ─── ComplianceSection (exported) ────────────────────────────────────────────

const PENDING_CHECK_LABELS_COMPLIANCE: Record<ComplianceCheckName, { icon: React.ReactNode; title: string }> = {
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

function CompliancePendingCard({ name }: Readonly<{ name: ComplianceCheckName }>) {
  const { icon, title } = PENDING_CHECK_LABELS_COMPLIANCE[name];
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

function PendingOrContent({ name, hasData, pendingChecks, children }: Readonly<{
  name: ComplianceCheckName;
  hasData: boolean;
  pendingChecks: ComplianceCheckName[];
  children: React.ReactNode;
}>) {
  if (hasData) return <>{children}</>;
  if (pendingChecks.includes(name)) return <CompliancePendingCard name={name} />;
  return null;
}

export function ComplianceSection({ clientId, draweeId, compliance, viewRaw, toggleRaw, pendingChecks }: Readonly<{
  clientId?: string;
  draweeId?: string;
  compliance: ComplianceResults;
  viewRaw: Record<string, boolean>;
  toggleRaw: (id: string) => void;
  pendingChecks: ComplianceCheckName[];
}>) {
  const hasCguData = !!(compliance.cgu.ceis.queriedAt || compliance.cgu.cnep.queriedAt || compliance.cgu.cepim.queriedAt);

  return (
    <div className="px-8 pb-8 space-y-3">
      <PendingOrContent name="cgu" hasData={hasCguData} pendingChecks={pendingChecks}>
        <CguSubCard cgu={compliance.cgu} viewRaw={viewRaw} toggleRaw={toggleRaw} />
      </PendingOrContent>

      {compliance.pep.length > 0 && (
        <ComplianceSubCard
          icon={<UserCheck size={15} className="text-primary" />}
          title="PEP — Pessoas Expostas Politicamente"
          badge={<StatusBadge
            value={compliance.pep.some((p) => p.hasMatch) ? 'Encontrado' : 'Nada consta'}
            type={compliance.pep.some((p) => p.hasMatch) ? 'danger' : 'success'}
          />}
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

      <PendingOrContent name="pgfn" hasData={!!compliance.pgfn} pendingChecks={pendingChecks}>
        {compliance.pgfn && <PgfnCheckCard pgfn={compliance.pgfn} viewRaw={viewRaw} toggleRaw={toggleRaw} />}
      </PendingOrContent>

      <PendingOrContent name="cndt" hasData={!!compliance.cndt} pendingChecks={pendingChecks}>
        {compliance.cndt && (
          <ComplianceSubCard
            icon={<Scale size={15} className="text-primary" />}
            title="CNDT — Débitos Trabalhistas (TST)"
            badge={<CndtBadge status={compliance.cndt.certificateStatus} />}
          >
            <CndtStatusContent cndt={compliance.cndt} />
          </ComplianceSubCard>
        )}
      </PendingOrContent>

      <PendingOrContent name="sanctions" hasData={compliance.sanctions.length > 0} pendingChecks={pendingChecks}>
        <SanctionsSubCard sanctions={compliance.sanctions} viewRaw={viewRaw} toggleRaw={toggleRaw} />
      </PendingOrContent>

      <PendingOrContent name="slaveLaborCheck" hasData={!!compliance.slaveLaborCheck} pendingChecks={pendingChecks}>
        {compliance.slaveLaborCheck && (
          <SlaveLaborCard check={compliance.slaveLaborCheck} viewRaw={viewRaw} toggleRaw={toggleRaw} />
        )}
      </PendingOrContent>

      {pendingChecks.includes('negativeMedia') ? (
        <CompliancePendingCard name="negativeMedia" />
      ) : (
        <ComplianceSubCard
          icon={<Search size={15} className="text-primary" />}
          title="Mídia Negativa — OSINT"
          badge={compliance.negativeMedia.length > 0
            ? <MediaRiskBadge level={compliance.negativeMedia[0]?.riskLevel ?? 'CLEAR'} />
            : undefined}
          defaultOpen={compliance.negativeMedia[0]?.riskLevel === 'HIGH' || compliance.negativeMedia[0]?.riskLevel === 'MEDIUM'}
        >
          <NegativeMediaSection
            initialSearches={compliance.negativeMedia}
            clientId={clientId}
            draweeId={draweeId}
          />
        </ComplianceSubCard>
      )}

      <PendingOrContent name="digitalPresence" hasData={!!compliance.digitalPresence} pendingChecks={pendingChecks}>
        {compliance.digitalPresence && (
          <ComplianceSubCard
            icon={<Monitor size={15} className="text-primary" />}
            title="Presença Digital"
            badge={<DigitalPresenceBadge digitalPresence={compliance.digitalPresence} />}
          >
            <DigitalPresenceSection digitalPresence={compliance.digitalPresence} />
          </ComplianceSubCard>
        )}
      </PendingOrContent>
    </div>
  );
}

// ─── useCompliancePolling (exported) ─────────────────────────────────────────

export function useCompliancePolling(clientId: string) {
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
