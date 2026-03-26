'use client';

import { Loader2, FileDown, ShieldAlert, Shield, Scale, Building2, Users, MessageSquare, Globe, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Card } from '@nexus/ui';
import { SectionGroup } from './upminer.section-group';
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
import { InfoField, CardHeaderSmall } from './upminer.ui';
import { formatCnpj } from './upminer.utils';
import type { UpminerDossiersDataDossier } from './upminer.types';

// ─── Risk Summary Panel ───────────────────────────────────────────────────────

interface RiskSummaryPanelProps {
  dossier: UpminerDossiersDataDossier;
}

function RiskSummaryPanel({ dossier }: Readonly<RiskSummaryPanelProps>) {
  const sancaoCount = (dossier.sancaoHits?.length ?? 0) + (dossier.sicaf ? 1 : 0);
  const processosCount =
    (dossier.cadeProcessos?.length ?? 0) +
    (dossier.mpfProcessos?.length ?? 0) +
    (dossier.djenCitacoes?.length ?? 0) +
    (dossier.crsfnAcoes?.length ?? 0) +
    (dossier.tcuProcessos?.length ?? 0);
  const certidoesCount = dossier.certidoes?.length ?? 0;
  const reputacaoCount = (dossier.proconAnos?.length ?? 0) + (dossier.reclameAqui ? 1 : 0);

  let overallRisk: 'high' | 'medium' | 'low';
  if (sancaoCount > 0) {
    overallRisk = 'high';
  } else if (processosCount > 0) {
    overallRisk = 'medium';
  } else {
    overallRisk = 'low';
  }

  const riskConfig = {
    high: {
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40',
      indicator: 'bg-red-600',
      label: 'Risco Alto',
      labelColor: 'text-red-700 dark:text-red-400',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
      indicator: 'bg-amber-500',
      label: 'Risco Médio',
      labelColor: 'text-amber-700 dark:text-amber-400',
    },
    low: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
      indicator: 'bg-emerald-600',
      label: 'Sem alertas',
      labelColor: 'text-emerald-700 dark:text-emerald-400',
    },
  };

  const risk = riskConfig[overallRisk];

  return (
    <div className={`rounded-lg border p-4 ${risk.bg}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${risk.indicator}`} />
          <span className={`text-sm font-bold ${risk.labelColor}`}>{risk.label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <RiskPill
            label="Sanções"
            count={sancaoCount}
            variant={sancaoCount > 0 ? 'red' : 'green'}
          />
          <RiskPill
            label="Processos"
            count={processosCount}
            variant={processosCount > 0 ? 'amber' : 'green'}
          />
          <RiskPill
            label="Certidões"
            count={certidoesCount}
            variant="green"
          />
          {reputacaoCount > 0 && (
            <RiskPill
              label="Reputação"
              count={reputacaoCount}
              variant="amber"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RiskPill({
  label,
  count,
  variant,
}: Readonly<{ label: string; count: number; variant: 'red' | 'amber' | 'green' }>) {
  const styles = {
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  };

  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>
      {variant === 'red' && <ShieldAlert className="h-3 w-3 shrink-0" />}
      {variant === 'amber' && <Scale className="h-3 w-3 shrink-0" />}
      {variant === 'green' && <CheckCircle2 className="h-3 w-3 shrink-0" />}
      <span>{label}: <strong>{count}</strong></span>
    </div>
  );
}

// ─── Source Badges ────────────────────────────────────────────────────────────

function SourcesBadges({ dossier }: Readonly<{ dossier: UpminerDossiersDataDossier }>) {
  if (dossier.sources.length === 0) return null;

  const withResult = dossier.sources.filter((s) => s.hasResult);
  const withoutResult = dossier.sources.filter((s) => !s.hasResult);

  return (
    <div className="space-y-3">
      {withResult.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Com resultado</p>
          <div className="flex flex-wrap gap-1.5">
            {withResult.map((s) => (
              <Badge
                key={`${s.method}-result`}
                variant="outline"
                className="text-[10px] font-normal border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" />
                {s.name || s.method}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {withoutResult.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Sem ocorrências</p>
          <div className="flex flex-wrap gap-1.5">
            {withoutResult.map((s) => (
              <Badge
                key={`${s.method}-no-result`}
                variant="outline"
                className="text-[10px] font-normal text-muted-foreground"
              >
                {s.name || s.method}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Receita Federal PJ ───────────────────────────────────────────────────────

function ReceitaFederalCard({ dossier }: Readonly<{ dossier: UpminerDossiersDataDossier }>) {
  if (!dossier.receitaFederalPj) return null;
  const rf = dossier.receitaFederalPj;

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Building2 className="h-4 w-4" />} title="Receita Federal — PJ" />
      <div className="px-4 pb-4 pt-3 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          <InfoField label="CNPJ" value={formatCnpj(rf.cnpj)} />
          <InfoField label="Tipo" value={rf.tipo} />
          <InfoField label="Abertura" value={rf.dataAbertura} />
          <InfoField label="Nome empresarial" value={rf.nomeEmpresarial} />
          <InfoField label="Nome fantasia" value={rf.nomeFantasia} />
          <InfoField label="Atividade principal" value={rf.atividadeEconomicaPrincipal} />
        </div>
        {rf.secundarias.length > 0 && (
          <div className="overflow-x-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">Atividades secundárias</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Código</th>
                  <th className="pb-2 font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {rf.secundarias.map((sec, idx) => (
                  <tr key={`sec-${sec.codigo ?? idx}`} className="border-b border-muted/40 last:border-0">
                    <td className="py-1.5 pr-2 font-mono text-xs">{sec.codigo ?? '—'}</td>
                    <td className="py-1.5 text-sm">{sec.descricao ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── QSA Card ─────────────────────────────────────────────────────────────────

function QsaCard({ dossier }: Readonly<{ dossier: UpminerDossiersDataDossier }>) {
  if (!dossier.qsa) return null;
  const qsa = dossier.qsa;

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Users className="h-4 w-4" />} title="QSA — Quadro Societário" />
      <div className="px-4 pb-4 pt-3 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          <InfoField label="CNPJ" value={formatCnpj(qsa.cnpj)} />
          <InfoField label="Razão social" value={qsa.razaoSocial} />
          <InfoField label="Capital social" value={qsa.capitalSocial} />
          <InfoField label="Data consulta" value={qsa.dataConsulta} />
          <InfoField label="PEP (empresa)" value={qsa.pep} />
        </div>
        {qsa.socios.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Nome</th>
                  <th className="pb-2 pr-2 font-medium">CPF/CNPJ</th>
                  <th className="pb-2 pr-2 font-medium">Qualificação</th>
                  <th className="pb-2 pr-2 font-medium">%</th>
                  <th className="pb-2 font-medium">PEP</th>
                </tr>
              </thead>
              <tbody>
                {qsa.socios.map((soc, idx) => (
                  <tr key={`soc-${soc.cpfCnpj || idx}`} className="border-b border-muted/40 last:border-0">
                    <td className="py-1.5 pr-2 font-semibold">{soc.nome ?? '—'}</td>
                    <td className="py-1.5 pr-2 font-mono text-xs">{soc.cpfCnpj ?? '—'}</td>
                    <td className="py-1.5 pr-2 text-sm">{soc.qualificacao ?? '—'}</td>
                    <td className="py-1.5 pr-2 text-sm">{soc.participacao ?? '—'}</td>
                    <td className="py-1.5 text-xs">
                      {soc.pep && soc.pep !== '0' && soc.pep !== 'Não' ? (
                        <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                          {soc.pep}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{soc.pep ?? '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── CADE Section wrapper ─────────────────────────────────────────────────────

function CadeSection({ dossier }: Readonly<{ dossier: UpminerDossiersDataDossier }>) {
  if (!dossier.cadeProcessos || dossier.cadeProcessos.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Scale className="h-4 w-4" />} title={`CADE — Processos (${dossier.cadeProcessos.length})`} variant="destructive" />
      <div className="px-4 py-3 space-y-2">
        {dossier.cadeProcessos.map((proc) => (
          <CadeProcessoItem
            key={proc.apiRowId ?? proc.processo ?? 'cade-proc'}
            proc={proc}
          />
        ))}
      </div>
    </Card>
  );
}

// ─── DossierView ─────────────────────────────────────────────────────────────

interface DossierViewProps {
  dossier: UpminerDossiersDataDossier;
  onRequestPdf: (apiDossierId: number) => void;
  pdfLoading: boolean;
}

export function DossierView({ dossier, onRequestPdf, pdfLoading }: Readonly<DossierViewProps>) {
  // Risk group counts
  const alertasCount =
    (dossier.sancaoHits?.length ?? 0) +
    (dossier.sicaf ? 1 : 0) +
    (dossier.cadeProcessos?.length ?? 0) +
    (dossier.crsfnAcoes?.length ?? 0) +
    (dossier.tcuProcessos?.length ?? 0);

  const litigiosidadeCount =
    (dossier.mpfProcessos?.length ?? 0) +
    (dossier.djenCitacoes?.length ?? 0);

  const vinculosCount = dossier.contratos?.length ?? 0;

  const reputacaoCount = (dossier.proconAnos?.length ?? 0) + (dossier.reclameAqui ? 1 : 0);

  const webCount = dossier.googleHits?.length ?? 0;

  const certidoesCount = dossier.certidoes?.length ?? 0;

  const hasAlertas =
    (dossier.sancaoHits && dossier.sancaoHits.length > 0) ||
    dossier.sicaf ||
    dossier.cadeProcessos.length > 0 ||
    (dossier.crsfnAcoes && dossier.crsfnAcoes.length > 0) ||
    (dossier.tcuProcessos && dossier.tcuProcessos.length > 0);

  return (
    <div className="space-y-4">
      {/* Dossier header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">Dossiê {dossier.apiDossierId}</p>
            {dossier.hasUpflag && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Upflag</Badge>
            )}
            {dossier.dossierState && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {dossier.dossierState}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Critério: {dossier.criterionName || dossier.criterionInput}
          </p>
          {(dossier.createdAtApi || dossier.processedAtApi) && (
            <p className="text-xs text-muted-foreground">
              {dossier.createdAtApi && `Criado: ${dossier.createdAtApi}`}
              {dossier.createdAtApi && dossier.processedAtApi && ' · '}
              {dossier.processedAtApi && `Processado: ${dossier.processedAtApi}`}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestPdf(dossier.apiDossierId)}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <FileDown className="h-3.5 w-3.5 mr-1.5" />
          )}
          PDF do dossiê
        </Button>
      </div>

      {/* Risk summary */}
      <RiskSummaryPanel dossier={dossier} />

      {/* Group 1: Alertas e Riscos */}
      {hasAlertas && (
        <SectionGroup
          title="Alertas e Riscos"
          icon={<ShieldAlert className="h-4 w-4" />}
          count={alertasCount}
          variant="destructive"
          defaultOpen
        >
          {((dossier.sancaoHits && dossier.sancaoHits.length > 0) || dossier.sicaf) && (
            <SancaoHitsSection hits={dossier.sancaoHits ?? []} sicaf={dossier.sicaf} />
          )}
          {dossier.cadeProcessos.length > 0 && (
            <CadeSection dossier={dossier} />
          )}
          {dossier.crsfnAcoes && dossier.crsfnAcoes.length > 0 && (
            <CrsfnSection acoes={dossier.crsfnAcoes} />
          )}
          {dossier.tcuProcessos && dossier.tcuProcessos.length > 0 && (
            <TcuSection processos={dossier.tcuProcessos} />
          )}
        </SectionGroup>
      )}

      {/* Group 2: Identificação */}
      {(dossier.receitaFederalPj || dossier.qsa) && (
        <SectionGroup
          title="Identificação"
          icon={<Building2 className="h-4 w-4" />}
          variant="neutral"
          defaultOpen
        >
          <ReceitaFederalCard dossier={dossier} />
          <QsaCard dossier={dossier} />
        </SectionGroup>
      )}

      {/* Group 3: Litigiosidade */}
      {litigiosidadeCount > 0 && (
        <SectionGroup
          title="Processos e Litigiosidade"
          icon={<Scale className="h-4 w-4" />}
          count={litigiosidadeCount}
          variant="warning"
          defaultOpen
        >
          {dossier.mpfProcessos && dossier.mpfProcessos.length > 0 && (
            <MpfSection processos={dossier.mpfProcessos} />
          )}
          {dossier.djenCitacoes && dossier.djenCitacoes.length > 0 && (
            <DjenSection citacoes={dossier.djenCitacoes} />
          )}
        </SectionGroup>
      )}

      {/* Group 4: Vínculos Públicos */}
      {vinculosCount > 0 && (
        <SectionGroup
          title="Vínculos Públicos"
          icon={<Building2 className="h-4 w-4" />}
          count={vinculosCount}
          variant="neutral"
          defaultOpen={false}
        >
          <ContratosSection contratos={dossier.contratos!} />
        </SectionGroup>
      )}

      {/* Group 5: Reputação */}
      {reputacaoCount > 0 && (
        <SectionGroup
          title="Reputação"
          icon={<MessageSquare className="h-4 w-4" />}
          count={reputacaoCount}
          variant="neutral"
          defaultOpen={false}
        >
          {dossier.proconAnos && dossier.proconAnos.length > 0 && (
            <ProconSpSection anos={dossier.proconAnos} />
          )}
          {dossier.reclameAqui && (
            <ReclameAquiSection data={dossier.reclameAqui} />
          )}
        </SectionGroup>
      )}

      {/* Group 6: Web */}
      {webCount > 0 && (
        <SectionGroup
          title="Referências Web"
          icon={<Globe className="h-4 w-4" />}
          count={webCount}
          variant="neutral"
          defaultOpen={false}
        >
          <GoogleHitsSection hits={dossier.googleHits!} />
        </SectionGroup>
      )}

      {/* Group 7: Certidões (collapsed by default — good news) */}
      {certidoesCount > 0 && (
        <SectionGroup
          title="Certidões Negativas"
          icon={<CheckCircle2 className="h-4 w-4" />}
          count={certidoesCount}
          variant="success"
          defaultOpen={false}
        >
          <CertidoesSection certidoes={dossier.certidoes!} />
        </SectionGroup>
      )}

      {/* Sources overview */}
      {dossier.sources.length > 0 && (
        <SectionGroup
          title="Fontes Consultadas"
          icon={<Shield className="h-4 w-4" />}
          count={dossier.sources.length}
          variant="neutral"
          defaultOpen={false}
        >
          <SourcesBadges dossier={dossier} />
        </SectionGroup>
      )}
    </div>
  );
}
