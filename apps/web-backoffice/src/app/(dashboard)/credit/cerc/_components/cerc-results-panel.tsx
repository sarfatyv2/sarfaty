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
        <p className="text-sm text-muted-foreground">
          Nenhum resultado neste filtro.
        </p>
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
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="space-y-1.5 text-sm">
                      <p className="font-medium leading-snug">{item.mensagem}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="font-mono">{formatTipoAlgoritmo(item.algoritmoTipo)}</span>
                        <span>{dimensaoLabel(item.algoritmoDimensao)}</span>
                        <span>{escopoLabel(item.algoritmoEscopo)}</span>
                        <span>{formatDatetime(item.dataConclusao)}</span>
                      </div>
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

function getConstatacaoSeverity(impacto: string): BadgeType {
  if (impacto === 'critico') return 'danger';
  if (impacto === 'alerta') return 'warning';
  if (impacto === 'consistente') return 'success';
  return 'neutral';
}

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
      <span className="font-medium text-right">{value || '—'}</span>
    </div>
  );
}

function ConstatacoesList({ constatacoes }: Readonly<{ constatacoes: CercConstatacao[] }>) {
  const groupedByImpact = useMemo(() => {
    const order: CercResultadoImpacto[] = ['critico', 'alerta', 'consistente', 'neutro'];
    const map = new Map<CercResultadoImpacto, CercConstatacao[]>();
    for (const impact of order) {
      map.set(impact, constatacoes.filter((c) => c.impacto === impact));
    }
    return { map, order };
  }, [constatacoes]);

  if (constatacoes.length === 0)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={15} className="text-emerald-500" />
        Nenhuma constatação encontrada.
      </div>
    );

  return (
    <div className="space-y-4">
      {groupedByImpact.order.map((impact) => {
        const items = groupedByImpact.map.get(impact) ?? [];
        if (items.length === 0) return null;
        return (
          <div key={impact} className={`rounded-lg border p-3 space-y-2 ${impactGroupBorderClass(impact)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {IMPACT_LABELS[impact]} ({items.length})
            </p>
            <ul className="space-y-3">
              {items.map((c, idx) => (
                <li key={`${c.id}-${c.algoritmo.tipo}-${idx}`} className="space-y-1.5 text-sm">
                  <p className="font-medium leading-snug">{c.mensagem}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="font-mono">{formatTipoAlgoritmo(c.algoritmo.tipo)}</span>
                    <span>{dimensaoLabel(c.algoritmo.dimensao)}</span>
                    <span>{escopoLabel(c.algoritmo.escopo)}</span>
                    <span>{formatDatetime(c.data_conclusao)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

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

function ParteItem({ label, parte }: Readonly<{ label: string; parte?: CercParte | null }>) {
  if (!parte) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {(parte.razaoSocial ?? parte.nomeFantasia) && (
        <p className="text-sm font-medium">{parte.razaoSocial ?? parte.nomeFantasia}</p>
      )}
      <p className="text-sm font-mono text-muted-foreground">
        {parte.documentoTipo.toUpperCase()}{' '}
        {formatDocument(parte.documentoNumero, parte.documentoTipo)}
      </p>
      {parte.municipio && parte.uf && (
        <p className="text-xs text-muted-foreground">{parte.municipio} / {parte.uf}</p>
      )}
      {parte.atividadePrincipalDescricao && (
        <p className="text-xs text-muted-foreground truncate">{parte.atividadePrincipalDescricao}</p>
      )}
    </div>
  );
}

function DocFiscalSection({ docFiscal }: Readonly<{ docFiscal: CercDocFiscal }>) {
  return (
    <div className="space-y-2 text-sm">
      <InfoRow label="Tipo" value={docFiscal.tipo.toUpperCase()} />
      <InfoRow label="Número" value={docFiscal.numero} />
      <InfoRow label="Série" value={docFiscal.serie} />
      <InfoRow label="Situação" value={docFiscal.situacao} />
      <InfoRow label="Emissão" value={formatDatetime(docFiscal.dataEmissao)} />
      <InfoRow label="Valor Total" value={formatCurrency(docFiscal.valorTotal)} />
      {docFiscal.chaveAcesso && (
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Chave NF-e</p>
          <p className="font-mono text-[11px] break-all">{docFiscal.chaveAcesso}</p>
        </div>
      )}
      {(docFiscal.emitenteNome ?? docFiscal.emitenteCnpj) && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Emitente</p>
          {docFiscal.emitenteNome && <p className="text-xs font-medium">{docFiscal.emitenteNome}</p>}
          {docFiscal.emitenteCnpj && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CNPJ {formatDocument(docFiscal.emitenteCnpj, 'cnpj')}
            </p>
          )}
        </div>
      )}
      {(docFiscal.destinatarioNome ?? docFiscal.destinatarioCnpj ?? docFiscal.destinatarioCpf) && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Destinatário</p>
          {docFiscal.destinatarioNome && <p className="text-xs font-medium">{docFiscal.destinatarioNome}</p>}
          {docFiscal.destinatarioCnpj && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CNPJ {formatDocument(docFiscal.destinatarioCnpj, 'cnpj')}
            </p>
          )}
          {!docFiscal.destinatarioCnpj && docFiscal.destinatarioCpf && (
            <p className="font-mono text-[11px] text-muted-foreground">
              CPF {formatDocument(docFiscal.destinatarioCpf, 'cpf')}
            </p>
          )}
        </div>
      )}
      {docFiscal.naturezaOperacao && (
        <InfoRow label="Natureza Op." value={docFiscal.naturezaOperacao} />
      )}
      {docFiscal.modalidadeFrete && (
        <InfoRow label="Frete" value={docFiscal.modalidadeFrete} />
      )}
    </div>
  );
}

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
              <td className="py-1.5 max-w-[200px] truncate" title={p.descricao}>{p.descricao}</td>
              <td className="py-1.5 text-right">{p.quantidade ? Number(p.quantidade).toLocaleString('pt-BR') : '—'}</td>
              <td className="py-1.5 text-right">{formatCurrency(p.valorUnitario)}</td>
              <td className="py-1.5 text-right">{formatCurrency(p.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

      {/* IDs */}
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
          {/* Constatações (from cerc_validation_resultados, passed as prop) */}
          <ExpandableSection
            icon={<AlertTriangle size={15} className="text-amber-500" />}
            title="Constatações"
            badge={
              constatacoes.length > 0 ? (
                <StatusBadge
                  value={String(constatacoes.length)}
                  type={hasDangerConstatacao ? 'danger' : 'warning'}
                />
              ) : (
                <StatusBadge value="0" type="success" />
              )
            }
            defaultOpen
          >
            <ConstatacoesList constatacoes={constatacoes} />
          </ExpandableSection>

          {/* Resultados de análise (cerc_validation_resultados) */}
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
            defaultOpen
          >
            <ResultadosAnaliseSection resultados={resultados} />
          </ExpandableSection>

          {/* Documento Fiscal */}
          {docFiscal && (
            <ExpandableSection
              icon={<FileText size={15} className="text-green-600" />}
              title="Documento Fiscal"
              defaultOpen={false}
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
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
