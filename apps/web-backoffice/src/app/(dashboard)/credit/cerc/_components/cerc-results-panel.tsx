'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Loader2, ShieldCheck, AlertTriangle, CheckCircle2,
  Users, FileText, Activity, RefreshCw, Code2, ChevronDown,
  Landmark, ListChecks, Package, CalendarCheck,
} from 'lucide-react';
import { Badge, Button, Card, CardContent, ScrollArea } from '@nexus/ui';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  CercValidationRecord, CercConstatacao, CercEvento, CercParte,
  CercDocFiscal, CercNfeDuplicata, CercNfeProduto, CercNfeEventoFiscal,
  CercResultado, CercResultadoDimensao, CercResultadoImpacto,
} from './cerc.types';

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

function StatusBadge({ value, type }: Readonly<{ value: string; type: BadgeType }>) {
  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5 text-xs`}>{value}</Badge>;
}

function formatDocument(numero: string, tipo: string): string {
  const digits = numero.replaceAll(/\D/g, '');
  if (tipo === 'cpf' && digits.length === 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (tipo === 'cnpj' && digits.length === 14)
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return numero;
}

function formatDatetime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

function formatCurrency(value: number | string | undefined | null): string {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const DIMENSION_FILTERS: Array<{ value: 'all' | CercResultadoDimensao; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'credito', label: 'Crédito' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'logistica', label: 'Logística' },
  { value: 'mercantil', label: 'Mercantil' },
];

const IMPACT_ORDER: CercResultadoImpacto[] = ['critico', 'alerta', 'consistente', 'neutro'];

const IMPACT_LABELS: Record<CercResultadoImpacto, string> = {
  critico: 'Crítico',
  alerta: 'Alerta',
  consistente: 'Consistente',
  neutro: 'Neutro',
};

function formatTipoAlgoritmo(tipo: string): string {
  return tipo.replaceAll('_', ' ');
}

function dimensaoLabel(d: string): string {
  const map: Record<string, string> = {
    credito: 'Crédito',
    fiscal: 'Fiscal',
    logistica: 'Logística',
    mercantil: 'Mercantil',
  };
  return map[d] ?? d;
}

function escopoLabel(escopo: string): string {
  const map: Record<string, string> = {
    parte: 'Parte',
    dfe: 'DF-e',
    recebivel: 'Recebível',
  };
  return map[escopo] ?? escopo;
}

function impactGroupBorderClass(impact: CercResultadoImpacto): string {
  switch (impact) {
    case 'critico':
      return 'border-red-200 bg-red-50/50';
    case 'alerta':
      return 'border-amber-200 bg-amber-50/50';
    case 'consistente':
      return 'border-emerald-200 bg-emerald-50/50';
    default:
      return 'border-slate-200 bg-slate-50/50';
  }
}

function parseJsonField(value: string | null | undefined): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // not valid JSON
  }
  return null;
}

function renderFieldValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch { return '[objeto]'; }
  }
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  return '—';
}

function isQualificacaoAlgoritmo(tipo: string): boolean {
  const t = tipo.toLowerCase();
  return t.includes('qualificacao') || t.includes('avaliacao') || t.includes('scoring') || t.includes('score');
}

function situacaoCadastralBadgeType(status: string): BadgeType {
  const s = status.toUpperCase();
  if (s === 'ATIVA') return 'success';
  if (s === 'BAIXADA' || s === 'INAPTA' || s === 'SUSPENSA') return 'danger';
  return 'warning';
}

function getConstatacaoSeverity(impacto: string): BadgeType {
  if (impacto === 'critico') return 'danger';
  if (impacto === 'alerta') return 'warning';
  if (impacto === 'consistente') return 'success';
  return 'neutral';
}

/* ------------------------------------------------------------------ */
/* InfoComplementar                                                     */
/* ------------------------------------------------------------------ */

function InfoComplementar({
  informacoesComplementares,
  dadosUtilizados,
  parametrosDoAlgoritmo,
}: Readonly<{
  informacoesComplementares: string | null | undefined;
  dadosUtilizados: string | null | undefined;
  parametrosDoAlgoritmo?: string | null | undefined;
}>) {
  const [showParametros, setShowParametros] = useState(false);

  const infoObj = parseJsonField(informacoesComplementares);
  const dadosObj = parseJsonField(dadosUtilizados);
  const paramObj = parseJsonField(parametrosDoAlgoritmo);

  const hasInfo = infoObj !== null && Object.keys(infoObj).length > 0;
  const hasDados = dadosObj !== null && Object.keys(dadosObj).length > 0;
  const hasParametros = (paramObj !== null && Object.keys(paramObj).length > 0) || !!parametrosDoAlgoritmo;

  const hasAnyContent = hasInfo || hasDados || hasParametros || !!informacoesComplementares || !!dadosUtilizados;
  if (!hasAnyContent) return null;

  return (
    <div className="mt-1.5 space-y-1">
      {hasInfo && (
        <dl className="flex flex-wrap gap-x-4 gap-y-0.5">
          {Object.entries(infoObj).map(([key, val]) => (
            <div key={key} className="flex items-baseline gap-1 text-[11px]">
              <dt className="text-muted-foreground capitalize">{key.replaceAll('_', ' ')}:</dt>
              <dd className="font-semibold text-foreground">{renderFieldValue(val)}</dd>
            </div>
          ))}
        </dl>
      )}
      {!hasInfo && informacoesComplementares && (
        <p className="text-[11px] text-muted-foreground italic">{informacoesComplementares}</p>
      )}
      {hasDados && (
        <dl className="flex flex-wrap gap-x-4 gap-y-0.5">
          {Object.entries(dadosObj).map(([key, val]) => (
            <div key={key} className="flex items-baseline gap-1 text-[11px]">
              <dt className="text-muted-foreground capitalize">{key.replaceAll('_', ' ')}:</dt>
              <dd className="font-medium text-muted-foreground">{renderFieldValue(val)}</dd>
            </div>
          ))}
        </dl>
      )}
      {!hasDados && dadosUtilizados && (
        <p className="text-[11px] text-muted-foreground italic">{dadosUtilizados}</p>
      )}
      {hasParametros && (
        <div>
          <button
            type="button"
            onClick={() => setShowParametros((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <motion.div animate={{ rotate: showParametros ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={10} />
            </motion.div>
            {showParametros ? 'Ocultar parâmetros' : 'Ver parâmetros'}
          </button>
          {showParametros && (
            <div className="mt-1 pl-2.5 border-l-2 border-muted">
              {paramObj !== null && Object.keys(paramObj).length > 0 ? (
                <dl className="flex flex-wrap gap-x-4 gap-y-0.5">
                  {Object.entries(paramObj).map(([key, val]) => (
                    <div key={key} className="flex items-baseline gap-1 text-[11px]">
                      <dt className="text-muted-foreground capitalize">{key.replaceAll('_', ' ')}:</dt>
                      <dd className="font-mono text-[10px] text-muted-foreground">{renderFieldValue(val)}</dd>
                    </div>
                  ))}
                </dl>
              ) : parametrosDoAlgoritmo ? (
                <p className="text-[10px] font-mono text-muted-foreground italic">{parametrosDoAlgoritmo}</p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DuplicataResumo                                                      */
/* ------------------------------------------------------------------ */

function DuplicataResumo({ record }: Readonly<{ record: CercValidationRecord }>) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <p className="text-[11px] text-muted-foreground">Nº Duplicata</p>
          <p className="text-sm font-mono font-semibold">{record.numeroDuplicata}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Valor</p>
          <p className="text-sm font-semibold">{formatCurrency(record.valor)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Vencimento</p>
          <p className="text-sm font-medium">{formatDate(record.vencimento)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-border/40">
        <div>
          <p className="text-[11px] text-muted-foreground">Cedente (CNPJ)</p>
          <p className="text-xs font-mono">{formatDocument(record.cnpjCedente, 'cnpj')}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">
            Pagador ({record.tipoPagador.toUpperCase()})
          </p>
          <p className="text-xs font-mono">
            {formatDocument(record.cnpjCpfPagador, record.tipoPagador)}
          </p>
        </div>
        {record.referenciaExterna && (
          <div>
            <p className="text-[11px] text-muted-foreground">Referência</p>
            <p className="text-xs">{record.referenciaExterna}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InsightsBlock                                                        */
/* ------------------------------------------------------------------ */

function InsightsBlock({ resultados }: Readonly<{ resultados: CercResultado[] }>) {
  const criticoCount = resultados.filter((r) => r.impacto === 'critico').length;
  const alertaCount = resultados.filter((r) => r.impacto === 'alerta').length;

  const verdict: 'reprovado' | 'atencao' | 'consistente' =
    criticoCount > 0 ? 'reprovado' : alertaCount > 0 ? 'atencao' : 'consistente';

  const verdictConfig = {
    reprovado: {
      label: 'Reprovado',
      Icon: AlertTriangle,
      wrapperClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-700',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      itemBg: 'bg-red-50/60 border-red-100',
      itemText: 'text-red-700',
    },
    atencao: {
      label: 'Em Atenção',
      Icon: AlertTriangle,
      wrapperClass: 'bg-amber-50 border-amber-200',
      textClass: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      itemBg: 'bg-amber-50/60 border-amber-100',
      itemText: 'text-amber-700',
    },
    consistente: {
      label: 'Consistente',
      Icon: ShieldCheck,
      wrapperClass: 'bg-emerald-50 border-emerald-200',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      itemBg: 'bg-emerald-50/60 border-emerald-100',
      itemText: 'text-emerald-700',
    },
  };

  const vc = verdictConfig[verdict];
  const { Icon: VerdictIcon } = vc;

  const qualificacoes = useMemo(
    () =>
      resultados
        .filter((r) => isQualificacaoAlgoritmo(r.algoritmoTipo))
        .map((r) => ({
          tipo: r.algoritmoTipo,
          dimensao: r.algoritmoDimensao,
          impacto: r.impacto,
          info: parseJsonField(r.informacoesComplementares),
        }))
        .filter((q) => q.info !== null),
    [resultados],
  );

  const dims: { value: CercResultadoDimensao; label: string }[] = [
    { value: 'credito', label: 'Crédito' },
    { value: 'fiscal', label: 'Fiscal' },
    { value: 'logistica', label: 'Logística' },
    { value: 'mercantil', label: 'Mercantil' },
  ];

  const breakdown = useMemo(
    () =>
      dims
        .map((d) => ({
          ...d,
          critico: resultados.filter((r) => r.algoritmoDimensao === d.value && r.impacto === 'critico').length,
          alerta: resultados.filter((r) => r.algoritmoDimensao === d.value && r.impacto === 'alerta').length,
          total: resultados.filter((r) => r.algoritmoDimensao === d.value).length,
        }))
        .filter((d) => d.total > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resultados],
  );

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${vc.wrapperClass}`}>
      {/* Verdict */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <VerdictIcon size={16} className={vc.textClass} />
          <span className={`text-sm font-semibold ${vc.textClass}`}>
            Parecer: {vc.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {criticoCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold text-xs">
              {criticoCount} crítico{criticoCount > 1 ? 's' : ''}
            </Badge>
          )}
          {alertaCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold text-xs">
              {alertaCount} alerta{alertaCount > 1 ? 's' : ''}
            </Badge>
          )}
          {criticoCount === 0 && alertaCount === 0 && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-xs">
              {resultados.length} verificados
            </Badge>
          )}
        </div>
      </div>

      {/* Qualificações em destaque */}
      {qualificacoes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Qualificações
          </p>
          <div className="flex flex-wrap gap-2">
            {qualificacoes.map((q, idx) => {
              const severity = getConstatacaoSeverity(q.impacto);
              const infoEntries = q.info ? Object.entries(q.info).slice(0, 4) : [];
              return (
                <div
                  key={`${q.tipo}-${idx}`}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                    severity === 'danger'
                      ? 'bg-red-50 border-red-200'
                      : severity === 'warning'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {formatTipoAlgoritmo(q.tipo)}
                  </span>
                  {infoEntries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {infoEntries.map(([key, val]) => (
                        <span
                          key={key}
                          className={`font-bold ${
                            severity === 'danger'
                              ? 'text-red-700'
                              : severity === 'warning'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                          }`}
                          title={key.replaceAll('_', ' ')}
                        >
                          {renderFieldValue(val)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown por dimensão */}
      {breakdown.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {breakdown.map((d) => (
            <div
              key={d.value}
              className="flex items-center gap-1.5 bg-white/60 rounded px-2 py-1 text-xs border border-white/80"
            >
              <span className="text-muted-foreground">{d.label}</span>
              {d.critico > 0 && (
                <span className="text-red-600 font-semibold">{d.critico}c</span>
              )}
              {d.alerta > 0 && (
                <span className="text-amber-600 font-semibold">{d.alerta}a</span>
              )}
              {d.critico === 0 && d.alerta === 0 && (
                <CheckCircle2 size={10} className="text-emerald-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ResultadosAnaliseSection                                             */
/* ------------------------------------------------------------------ */

function ResultadosAnaliseSection({ resultados }: Readonly<{ resultados: CercResultado[] }>) {
  const [dimensaoFilter, setDimensaoFilter] = useState<'all' | CercResultadoDimensao>('all');

  const filtered = useMemo(() => {
    if (dimensaoFilter === 'all') return resultados;
    return resultados.filter((r) => r.algoritmoDimensao === dimensaoFilter);
  }, [resultados, dimensaoFilter]);

  const groupedByImpact = useMemo(() => {
    const map = new Map<CercResultadoImpacto, CercResultado[]>();
    for (const impact of IMPACT_ORDER) {
      map.set(impact, filtered.filter((r) => r.impacto === impact));
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {DIMENSION_FILTERS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={dimensaoFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setDimensaoFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum resultado neste filtro.</p>
      ) : (
        <div className="space-y-4">
          {IMPACT_ORDER.map((impact) => {
            const items = groupedByImpact.get(impact) ?? [];
            if (items.length === 0) return null;
            return (
              <div
                key={impact}
                className={`rounded-lg border p-3 space-y-2 ${impactGroupBorderClass(impact)}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {IMPACT_LABELS[impact]} ({items.length})
                </p>
                <ul className="space-y-3 divide-y divide-border/40">
                  {items.map((item) => (
                    <li key={item.id} className="space-y-1.5 text-sm pt-3 first:pt-0">
                      <p className="font-medium leading-snug">{item.mensagem}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="font-mono">{formatTipoAlgoritmo(item.algoritmoTipo)}</span>
                        <span>{dimensaoLabel(item.algoritmoDimensao)}</span>
                        <span>{escopoLabel(item.algoritmoEscopo)}</span>
                        <span>{formatDatetime(item.dataConclusao)}</span>
                      </div>
                      <InfoComplementar
                        informacoesComplementares={item.informacoesComplementares}
                        dadosUtilizados={item.dadosUtilizados}
                        parametrosDoAlgoritmo={item.parametrosDoAlgoritmo}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RawJsonToggle + ExpandableSection                                    */
/* ------------------------------------------------------------------ */

function RawJsonToggle({ data }: Readonly<{ data: unknown }>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <Code2 size={11} />
        {open ? 'Ocultar JSON' : 'Ver JSON completo'}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={11} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <ScrollArea className="mt-2 max-h-64">
              <pre className="text-[10px] bg-muted/60 rounded p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExpandableSectionProps {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rawData?: unknown;
}

function ExpandableSection({
  icon, title, badge, children, defaultOpen = true, rawData,
}: Readonly<ExpandableSectionProps>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 cursor-pointer text-left"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <CardContent className="pt-0 pb-4 px-5">
              <div className="border-t pt-4 space-y-3">
                {children}
                {rawData != null && <RawJsonToggle data={rawData} />}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ConstatacoesList — quick summary (critico + alerta only)            */
/* ------------------------------------------------------------------ */

function ConstatacoesList({ constatacoes }: Readonly<{ constatacoes: CercConstatacao[] }>) {
  const urgentItems = constatacoes.filter((c) => c.impacto === 'critico' || c.impacto === 'alerta');

  if (urgentItems.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
        {constatacoes.length === 0
          ? 'Nenhuma constatação encontrada.'
          : 'Sem constatações críticas ou de alerta.'}
      </div>
    );
  }

  const criticos = urgentItems.filter((c) => c.impacto === 'critico');
  const alertas = urgentItems.filter((c) => c.impacto === 'alerta');

  const renderItem = (c: CercConstatacao, idx: number) => {
    const severity = getConstatacaoSeverity(c.impacto);
    const infoObj = parseJsonField(c.informacoes_complementares);

    return (
      <li key={`${c.id}-${idx}`} className="space-y-1.5 pt-3 first:pt-0">
        <div className="flex items-start gap-2 flex-wrap">
          <StatusBadge
            value={c.impacto === 'critico' ? 'Crítico' : 'Alerta'}
            type={severity}
          />
          <p className="text-sm font-medium leading-snug flex-1">{c.mensagem}</p>
        </div>

        {infoObj !== null && Object.keys(infoObj).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.entries(infoObj).map(([key, val]) => (
              <div
                key={key}
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 ${
                  severity === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <span className="text-[10px] text-muted-foreground capitalize">
                  {key.replaceAll('_', ' ')}:
                </span>
                <span
                  className={`text-xs font-bold ${
                    severity === 'danger' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {renderFieldValue(val)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="font-mono">{formatTipoAlgoritmo(c.algoritmo.tipo)}</span>
          <span>{dimensaoLabel(c.algoritmo.dimensao)}</span>
          <span>{escopoLabel(c.algoritmo.escopo)}</span>
          <span>{formatDatetime(c.data_conclusao)}</span>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Exibindo apenas constatações críticas e de alerta.
        Ver todos em <span className="italic">Resultados de Análise</span>.
      </p>
      {criticos.length > 0 && (
        <div className={`rounded-lg border p-3 ${impactGroupBorderClass('critico')}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Crítico ({criticos.length})
          </p>
          <ul className="divide-y divide-red-200/50">
            {criticos.map((c, idx) => renderItem(c, idx))}
          </ul>
        </div>
      )}
      {alertas.length > 0 && (
        <div className={`rounded-lg border p-3 ${impactGroupBorderClass('alerta')}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Alerta ({alertas.length})
          </p>
          <ul className="divide-y divide-amber-200/50">
            {alertas.map((c, idx) => renderItem(c, idx))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EventosList                                                          */
/* ------------------------------------------------------------------ */

function EventosList({ eventos }: Readonly<{ eventos: CercEvento[] }>) {
  if (eventos.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>;

  const sorted = [...eventos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );

  return (
    <ol className="relative border-l border-border ml-2 space-y-4">
      {sorted.map((ev, idx) => (
        <li key={`${ev.codigo}-${idx}`} className="ml-4">
          <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border bg-background border-border" />
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs font-medium">{ev.codigo}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatDatetime(ev.data)}
            </span>
          </div>
          {ev.descricao && (
            <p className="text-xs text-muted-foreground mt-0.5">{ev.descricao}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* ParteItem                                                            */
/* ------------------------------------------------------------------ */

function ParteItem({ label, parte }: Readonly<{ label: string; parte?: CercParte | null }>) {
  if (!parte) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {(parte.razaoSocial ?? parte.nomeFantasia) && (
        <p className="text-sm font-semibold leading-snug">
          {parte.razaoSocial ?? parte.nomeFantasia}
        </p>
      )}
      <p className="text-xs font-mono text-muted-foreground">
        {parte.documentoTipo.toUpperCase()}{' '}
        {formatDocument(parte.documentoNumero, parte.documentoTipo)}
      </p>
      {parte.situacaoCadastralStatus && (
        <StatusBadge
          value={parte.situacaoCadastralStatus}
          type={situacaoCadastralBadgeType(parte.situacaoCadastralStatus)}
        />
      )}
      {(parte.municipio ?? parte.uf) && (
        <p className="text-xs text-muted-foreground">
          {[parte.municipio, parte.uf].filter(Boolean).join(' / ')}
          {parte.cep ? ` · CEP ${parte.cep}` : ''}
        </p>
      )}
      {parte.dataDeAbertura && (
        <p className="text-xs text-muted-foreground">
          Abertura: {formatDate(parte.dataDeAbertura)}
        </p>
      )}
      {parte.capitalSocial && (
        <p className="text-xs text-muted-foreground">
          Capital Social: {formatCurrency(parte.capitalSocial)}
        </p>
      )}
      {parte.atividadePrincipalDescricao && (
        <p className="text-xs text-muted-foreground truncate" title={parte.atividadePrincipalDescricao}>
          {parte.atividadePrincipalDescricao}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DocFiscalSection                                                     */
/* ------------------------------------------------------------------ */

function DocFiscalSection({ docFiscal }: Readonly<{ docFiscal: CercDocFiscal }>) {
  const hasImpostos = !!(
    docFiscal.valorIcms ?? docFiscal.valorPis ?? docFiscal.valorCofins ?? docFiscal.valorProdutos
  );
  const hasFatura = !!(
    docFiscal.faturaNumero ?? docFiscal.faturaValorOriginal ?? docFiscal.faturaValorLiquido
  );
  const hasTransportador = !!(docFiscal.transportadorNome ?? docFiscal.transportadorCnpj);

  return (
    <div className="space-y-3 text-sm">
      {/* Dados gerais */}
      <div className="space-y-2">
        <InfoRow
          label="Tipo"
          value={`${docFiscal.tipo.toUpperCase()}${docFiscal.modelo ? ` · Mod. ${docFiscal.modelo}` : ''}`}
        />
        <InfoRow label="Número" value={docFiscal.numero} />
        <InfoRow label="Série" value={docFiscal.serie} />
        <InfoRow label="Situação" value={docFiscal.situacao} />
        <InfoRow label="Emissão" value={formatDatetime(docFiscal.dataEmissao)} />
        <InfoRow label="Valor Total" value={formatCurrency(docFiscal.valorTotal)} />
        {docFiscal.naturezaOperacao && (
          <InfoRow label="Natureza Op." value={docFiscal.naturezaOperacao} />
        )}
        {docFiscal.modalidadeFrete && (
          <InfoRow label="Frete" value={docFiscal.modalidadeFrete} />
        )}
      </div>

      {/* Chave NF-e */}
      {docFiscal.chaveAcesso && (
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Chave NF-e</p>
          <p className="font-mono text-[11px] break-all bg-muted/40 rounded px-2 py-1.5">
            {docFiscal.chaveAcesso}
          </p>
        </div>
      )}

      {/* Emitente */}
      {(docFiscal.emitenteNome ?? docFiscal.emitenteCnpj) && (
        <div className="space-y-0.5 pt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground">Emitente</p>
          {docFiscal.emitenteNome && (
            <p className="text-xs font-medium">{docFiscal.emitenteNome}</p>
          )}
          {docFiscal.emitenteCnpj && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CNPJ {formatDocument(docFiscal.emitenteCnpj, 'cnpj')}
              {docFiscal.emitenteUf ? ` · UF ${docFiscal.emitenteUf}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Destinatário */}
      {(docFiscal.destinatarioNome ?? docFiscal.destinatarioCnpj ?? docFiscal.destinatarioCpf) && (
        <div className="space-y-0.5 pt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground">Destinatário</p>
          {docFiscal.destinatarioNome && (
            <p className="text-xs font-medium">{docFiscal.destinatarioNome}</p>
          )}
          {docFiscal.destinatarioCnpj && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CNPJ {formatDocument(docFiscal.destinatarioCnpj, 'cnpj')}
              {docFiscal.destinatarioUf ? ` · UF ${docFiscal.destinatarioUf}` : ''}
            </p>
          )}
          {!docFiscal.destinatarioCnpj && docFiscal.destinatarioCpf && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CPF {formatDocument(docFiscal.destinatarioCpf, 'cpf')}
              {docFiscal.destinatarioUf ? ` · UF ${docFiscal.destinatarioUf}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Fatura */}
      {hasFatura && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Fatura
          </p>
          {docFiscal.faturaNumero && (
            <InfoRow label="Nº Fatura" value={docFiscal.faturaNumero} />
          )}
          {docFiscal.faturaValorOriginal && (
            <InfoRow label="Valor Original" value={formatCurrency(docFiscal.faturaValorOriginal)} />
          )}
          {docFiscal.faturaValorLiquido && (
            <InfoRow label="Valor Líquido" value={formatCurrency(docFiscal.faturaValorLiquido)} />
          )}
        </div>
      )}

      {/* Impostos */}
      {hasImpostos && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Impostos
          </p>
          {docFiscal.valorProdutos && (
            <InfoRow label="Valor Produtos" value={formatCurrency(docFiscal.valorProdutos)} />
          )}
          {docFiscal.valorIcms && (
            <InfoRow label="ICMS" value={formatCurrency(docFiscal.valorIcms)} />
          )}
          {docFiscal.valorPis && (
            <InfoRow label="PIS" value={formatCurrency(docFiscal.valorPis)} />
          )}
          {docFiscal.valorCofins && (
            <InfoRow label="COFINS" value={formatCurrency(docFiscal.valorCofins)} />
          )}
        </div>
      )}

      {/* Transportador */}
      {hasTransportador && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Transportador
          </p>
          {docFiscal.transportadorNome && (
            <InfoRow label="Nome" value={docFiscal.transportadorNome} />
          )}
          {docFiscal.transportadorCnpj && (
            <InfoRow
              label="CNPJ"
              value={formatDocument(docFiscal.transportadorCnpj, 'cnpj')}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NfeDuplicatasSection                                                 */
/* ------------------------------------------------------------------ */

function NfeDuplicatasSection({ duplicatas }: Readonly<{ duplicatas: CercNfeDuplicata[] }>) {
  if (duplicatas.length === 0)
    return <p className="text-sm text-muted-foreground">Sem duplicatas.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="text-left pb-2 font-medium">Nº</th>
            <th className="text-right pb-2 font-medium">Valor</th>
            <th className="text-right pb-2 font-medium">Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {duplicatas.map((d) => (
            <tr key={d.id ?? d.numero} className="border-b last:border-0">
              <td className="py-1.5 font-mono">{d.numero}</td>
              <td className="py-1.5 text-right">{formatCurrency(d.valor)}</td>
              <td className="py-1.5 text-right">{formatDate(d.vencimento)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NfeProdutosSection                                                   */
/* ------------------------------------------------------------------ */

function NfeProdutosSection({ produtos }: Readonly<{ produtos: CercNfeProduto[] }>) {
  if (produtos.length === 0)
    return <p className="text-sm text-muted-foreground">Sem produtos.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="text-left pb-2 font-medium">Item</th>
            <th className="text-left pb-2 font-medium">Descrição</th>
            <th className="text-right pb-2 font-medium">Qtd</th>
            <th className="text-right pb-2 font-medium">Unit.</th>
            <th className="text-right pb-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id ?? p.num} className="border-b last:border-0">
              <td className="py-1.5 font-mono text-xs">{p.num}</td>
              <td className="py-1.5">
                <p className="max-w-[200px] truncate" title={p.descricao}>{p.descricao}</p>
                {(p.codigo ?? p.ncm ?? p.cfop ?? p.unidade) && (
                  <div className="flex flex-wrap gap-x-2 text-[10px] text-muted-foreground mt-0.5">
                    {p.codigo && <span>Cód: {p.codigo}</span>}
                    {p.ncm && <span>NCM: {p.ncm}</span>}
                    {p.cfop && <span>CFOP: {p.cfop}</span>}
                    {p.unidade && <span>Un: {p.unidade}</span>}
                  </div>
                )}
              </td>
              <td className="py-1.5 text-right">
                {p.quantidade ? Number(p.quantidade).toLocaleString('pt-BR') : '—'}
              </td>
              <td className="py-1.5 text-right">{formatCurrency(p.valorUnitario)}</td>
              <td className="py-1.5 text-right">{formatCurrency(p.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NfeEventosFiscaisSection                                             */
/* ------------------------------------------------------------------ */

function NfeEventosFiscaisSection({ eventos }: Readonly<{ eventos: CercNfeEventoFiscal[] }>) {
  if (eventos.length === 0)
    return <p className="text-sm text-muted-foreground">Sem eventos fiscais.</p>;

  const sorted = [...eventos].sort(
    (a, b) => new Date(a.data ?? 0).getTime() - new Date(b.data ?? 0).getTime(),
  );

  return (
    <ol className="relative border-l border-border ml-2 space-y-4">
      {sorted.map((ev, idx) => (
        <li key={`${ev.protocolo}-${idx}`} className="ml-4">
          <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border bg-background border-border" />
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs font-medium truncate max-w-[220px]">{ev.evento ?? ev.tipo}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatDatetime(ev.data)}
            </span>
          </div>
          {ev.orgao && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Órgão: {ev.orgao}</p>
          )}
          {ev.protocolo && (
            <p className="text-[11px] font-mono text-muted-foreground">{ev.protocolo}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* CercResultsPanel                                                     */
/* ------------------------------------------------------------------ */

interface CercResultsPanelProps {
  record: CercValidationRecord | null;
  resultados: CercResultado[];
  isLoadingDetail?: boolean;
  onRefresh: (id: string) => void;
}

export function CercResultsPanel({ record, resultados, isLoadingDetail, onRefresh }: Readonly<CercResultsPanelProps>) {
  const handleRefresh = useCallback(() => {
    if (record?.id) onRefresh(record.id);
  }, [record, onRefresh]);

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
        <Loader2 size={28} className="animate-spin text-primary/40" />
        <p className="text-sm text-muted-foreground">Carregando detalhes da validação...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
        <ShieldCheck size={40} className="text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Preencha o formulário e clique em <strong>Validar Duplicata</strong> para ver os resultados,
          ou selecione uma validação no histórico abaixo.
        </p>
      </div>
    );
  }

  const isPolling = record.status === 'PENDING' || record.status === 'POLLING';
  const isDone = record.status === 'PROCESSED';
  const isError = record.status === 'ERROR';

  let statusBadgeType: BadgeType = 'neutral';
  if (isDone) statusBadgeType = 'success';
  else if (isError) statusBadgeType = 'danger';

  const eventos = record.eventos ?? [];
  const partes = record.partes ?? [];
  const docFiscal = record.docFiscal ?? null;
  const nfeDuplicatas = record.nfeDuplicatas ?? [];
  const nfeProdutos = record.nfeProdutos ?? [];
  const nfeEventosFiscais = record.nfeEventosFiscais ?? [];

  const pagador = partes.find((p) => p.role === 'pagador') ?? null;
  const originador = partes.find((p) => p.role === 'originador') ?? null;
  const cedente = partes.find((p) => p.role === 'cedente') ?? null;

  const resultadosCriticoCount = resultados.filter((r) => r.impacto === 'critico').length;
  const resultadosAlertaCount = resultados.filter((r) => r.impacto === 'alerta').length;

  const constatacoes: CercConstatacao[] = resultados.map((r) => ({
    id: r.id,
    codigo: r.resultadoCercId,
    algoritmo: {
      id: r.id,
      codigo: r.resultadoCercId,
      nome: r.algoritmoTipo,
      tipo: r.algoritmoTipo,
      dimensao: r.algoritmoDimensao,
      escopo: r.algoritmoEscopo,
    },
    mensagem: r.mensagem,
    impacto: r.impacto,
    dados_utilizados: r.dadosUtilizados ?? '',
    parametros_do_algoritmo: r.parametrosDoAlgoritmo ?? '',
    informacoes_complementares: r.informacoesComplementares ?? '',
    data_conclusao: r.dataConclusao,
  }));

  const urgentConstatacaoCount = constatacoes.filter(
    (c) => c.impacto === 'critico' || c.impacto === 'alerta',
  ).length;
  const hasDangerConstatacao = constatacoes.some(
    (c) => getConstatacaoSeverity(c.impacto) === 'danger',
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isPolling && <Loader2 size={15} className="animate-spin text-primary" />}
          {isDone && <CheckCircle2 size={15} className="text-emerald-500" />}
          {isError && <AlertTriangle size={15} className="text-destructive" />}
          <span className="text-sm font-medium">
            {isPolling && 'Aguardando processamento...'}
            {isDone && 'Validação concluída'}
            {isError && 'Erro ao processar'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {record.statusProcessamento && (
            <StatusBadge value={record.statusProcessamento} type={statusBadgeType} />
          )}
          {!isPolling && (
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-7 gap-1.5">
              <RefreshCw size={12} />
              Atualizar
            </Button>
          )}
        </div>
      </div>

      {/* Resumo da Duplicata */}
      <DuplicataResumo record={record} />

      {/* IDs técnicos */}
      <div className="space-y-1">
        {record.id && (
          <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 rounded px-2.5 py-1.5 truncate">
            ID: {record.id}
          </div>
        )}
        {record.loteId && (
          <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 rounded px-2.5 py-1.5 truncate">
            Lote: {record.loteId}
          </div>
        )}
        {record.validacaoId && (
          <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 rounded px-2.5 py-1.5 truncate">
            Validação: {record.validacaoId}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {isPolling && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
          <p className="text-xs text-muted-foreground text-center">
            Aguardando CERC processar o lote...
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="py-6 flex items-start gap-3 text-sm text-destructive">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erro ao processar</p>
              {record.errorMessage && (
                <p className="text-xs mt-1 text-muted-foreground">{record.errorMessage}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isDone && (
        <div className="space-y-3">
          {/* Insights Block */}
          {resultados.length > 0 && (
            <InsightsBlock resultados={resultados} />
          )}

          {/* Constatações — quick summary (critico + alerta only) */}
          <ExpandableSection
            icon={<AlertTriangle size={15} className="text-amber-500" />}
            title="Constatações"
            badge={
              urgentConstatacaoCount > 0 ? (
                <StatusBadge
                  value={String(urgentConstatacaoCount)}
                  type={hasDangerConstatacao ? 'danger' : 'warning'}
                />
              ) : (
                <StatusBadge value="Sem alertas" type="success" />
              )
            }
            defaultOpen
          >
            <ConstatacoesList constatacoes={constatacoes} />
          </ExpandableSection>

          {/* Resultados de Análise — todos os resultados com filtro por dimensão */}
          <ExpandableSection
            icon={<ListChecks size={15} className="text-indigo-500" />}
            title="Resultados de Análise"
            badge={
              <div className="flex flex-wrap gap-1">
                {resultadosCriticoCount > 0 && (
                  <StatusBadge value={`${resultadosCriticoCount} crít.`} type="danger" />
                )}
                {resultadosAlertaCount > 0 && (
                  <StatusBadge value={`${resultadosAlertaCount} alerta`} type="warning" />
                )}
                <StatusBadge value={String(resultados.length)} type="neutral" />
              </div>
            }
            defaultOpen={false}
            rawData={resultados}
          >
            <ResultadosAnaliseSection resultados={resultados} />
          </ExpandableSection>

          {/* Documento Fiscal */}
          {docFiscal && (
            <ExpandableSection
              icon={<FileText size={15} className="text-green-600" />}
              title="Documento Fiscal"
              defaultOpen={false}
              rawData={docFiscal}
            >
              <DocFiscalSection docFiscal={docFiscal} />
            </ExpandableSection>
          )}

          {/* Duplicatas da NF-e */}
          {nfeDuplicatas.length > 0 && (
            <ExpandableSection
              icon={<CalendarCheck size={15} className="text-blue-500" />}
              title="Duplicatas"
              badge={<StatusBadge value={String(nfeDuplicatas.length)} type="neutral" />}
              defaultOpen={false}
            >
              <NfeDuplicatasSection duplicatas={nfeDuplicatas} />
            </ExpandableSection>
          )}

          {/* Produtos */}
          {nfeProdutos.length > 0 && (
            <ExpandableSection
              icon={<Package size={15} className="text-orange-500" />}
              title="Produtos"
              badge={<StatusBadge value={String(nfeProdutos.length)} type="neutral" />}
              defaultOpen={false}
            >
              <NfeProdutosSection produtos={nfeProdutos} />
            </ExpandableSection>
          )}

          {/* Partes */}
          {partes.length > 0 && (
            <ExpandableSection
              icon={<Users size={15} className="text-violet-500" />}
              title="Partes"
              defaultOpen={false}
              rawData={partes}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ParteItem label="Cedente" parte={cedente} />
                <ParteItem label="Originador" parte={originador} />
                <ParteItem label="Pagador" parte={pagador} />
              </div>
            </ExpandableSection>
          )}

          {/* Eventos CERC */}
          {eventos.length > 0 && (
            <ExpandableSection
              icon={<Activity size={15} className="text-sky-500" />}
              title="Eventos CERC"
              badge={<StatusBadge value={String(eventos.length)} type="neutral" />}
              defaultOpen={false}
            >
              <EventosList eventos={eventos} />
            </ExpandableSection>
          )}

          {/* Eventos Fiscais NF-e */}
          {nfeEventosFiscais.length > 0 && (
            <ExpandableSection
              icon={<Landmark size={15} className="text-slate-500" />}
              title="Eventos Fiscais NF-e"
              badge={<StatusBadge value={String(nfeEventosFiscais.length)} type="neutral" />}
              defaultOpen={false}
            >
              <NfeEventosFiscaisSection eventos={nfeEventosFiscais} />
            </ExpandableSection>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
            <p>Solicitado em: {formatDatetime(record.requestedAt)}</p>
            {record.processedAt && <p>Processado em: {formatDatetime(record.processedAt)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
