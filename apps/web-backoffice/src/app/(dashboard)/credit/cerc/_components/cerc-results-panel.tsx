'use client';

import { useState, useCallback } from 'react';
import {
  Loader2, ShieldCheck, AlertTriangle, CheckCircle2,
  Users, FileText, Activity, RefreshCw, Code2, ChevronDown,
  Receipt, Landmark,
} from 'lucide-react';
import { Badge, Button, Card, CardContent, ScrollArea } from '@nexus/ui';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  CercValidationRecord, CercConstatacao, CercEvento, CercPartes,
  CercDocumentoFiscal, CercValidacaoData,
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

function formatDocument(numero: string, tipo: 'cnpj' | 'cpf'): string {
  const digits = numero.replaceAll(/\D/g, '');
  if (tipo === 'cpf' && digits.length === 11)
    return digits.replaceAll(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (tipo === 'cnpj' && digits.length === 14)
    return digits.replaceAll(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return numero;
}

function formatDatetime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getConstatacaoSeverity(tipo: string): BadgeType {
  const t = tipo.toLowerCase();
  if (t.includes('inativa') || t.includes('incorporada') || t.includes('cancelada') ||
      t.includes('irregular') || t.includes('protesto') || t.includes('negativo') ||
      t.includes('bloqueado') || t.includes('suspenso'))
    return 'danger';
  if (t.includes('alerta') || t.includes('pendente') || t.includes('aviso')) return 'warning';
  if (t.includes('ok') || t.includes('ativo') || t.includes('regular')) return 'success';
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
  rawData?: object | null;
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
  if (constatacoes.length === 0)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={15} className="text-emerald-500" />
        Nenhuma constatação encontrada.
      </div>
    );

  return (
    <ul className="space-y-3">
      {constatacoes.map((c, idx) => {
        const severity = getConstatacaoSeverity(c.tipo);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${c.tipo}-${idx}`} className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {severity === 'danger' && <AlertTriangle size={13} className="text-red-500 shrink-0" />}
              {severity === 'warning' && <AlertTriangle size={13} className="text-amber-500 shrink-0" />}
              {(severity === 'success' || severity === 'neutral') &&
                <CheckCircle2 size={13} className="text-slate-400 shrink-0" />}
              <StatusBadge value={c.tipo} type={severity} />
              {c.created_at && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {formatDatetime(c.created_at)}
                </span>
              )}
            </div>
            {c.descricao && <p className="text-xs text-muted-foreground pl-5">{c.descricao}</p>}
            {c.dados && Object.keys(c.dados).length > 0 && (
              <div className="pl-5">
                <RawJsonToggle data={c.dados} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EventosList({ eventos }: Readonly<{ eventos: CercEvento[] }>) {
  if (eventos.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>;

  const sorted = [...eventos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <ol className="relative border-l border-border ml-2 space-y-4">
      {sorted.map((ev, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`${ev.tipo}-${idx}`} className="ml-4">
          <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border bg-background border-border" />
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs font-medium">{ev.tipo}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatDatetime(ev.created_at)}
            </span>
          </div>
          {ev.descricao && <p className="text-xs text-muted-foreground mt-0.5">{ev.descricao}</p>}
        </li>
      ))}
    </ol>
  );
}

function ParteItem({
  label, parte,
}: Readonly<{
  label: string;
  parte?: CercPartes['originador'] | null;
}>) {
  if (!parte) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {parte.nome && <p className="text-sm font-medium">{parte.nome}</p>}
      <p className="text-sm font-mono text-muted-foreground">
        {parte.documento.tipo.toUpperCase()}{' '}
        {formatDocument(parte.documento.identificador.numero, parte.documento.tipo)}
      </p>
    </div>
  );
}

function DocFiscalSection({ docFiscal }: Readonly<{ docFiscal: CercDocumentoFiscal }>) {
  return (
    <div className="space-y-2 text-sm">
      <InfoRow label="Tipo" value={docFiscal.tipo?.toUpperCase()} />
      <InfoRow label="Número" value={docFiscal.numero} />
      <InfoRow label="Série" value={docFiscal.serie} />
      <InfoRow label="Emissão" value={formatDatetime(docFiscal.data_emissao)} />
      <InfoRow label="Valor Total" value={formatCurrency(docFiscal.valor_total)} />
      {docFiscal.chave && (
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Chave NF-e</p>
          <p className="font-mono text-[11px] break-all">{docFiscal.chave}</p>
        </div>
      )}
      {docFiscal.emitente && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Emitente</p>
          <p className="font-mono text-[11px]">
            {docFiscal.emitente.documento.tipo.toUpperCase()}{' '}
            {formatDocument(docFiscal.emitente.documento.identificador.numero, docFiscal.emitente.documento.tipo)}
          </p>
          {docFiscal.emitente.nome && <p className="text-xs">{docFiscal.emitente.nome}</p>}
        </div>
      )}
      {docFiscal.destinatario && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Destinatário</p>
          <p className="font-mono text-[11px]">
            {docFiscal.destinatario.documento.tipo.toUpperCase()}{' '}
            {formatDocument(docFiscal.destinatario.documento.identificador.numero, docFiscal.destinatario.documento.tipo)}
          </p>
          {docFiscal.destinatario.nome && <p className="text-xs">{docFiscal.destinatario.nome}</p>}
        </div>
      )}
    </div>
  );
}

function RecebivelSection({ validacaoData }: Readonly<{ validacaoData: CercValidacaoData }>) {
  const rec = validacaoData.recebivel;
  if (!rec) return null;
  return (
    <div className="space-y-2 text-sm">
      <InfoRow label="Tipo" value={rec.tipo?.replaceAll('_', ' ')} />
      <InfoRow label="Número" value={rec.identificador?.numero} />
      <InfoRow
        label="Vencimento"
        value={rec.vencimento ? new Date(rec.vencimento).toLocaleDateString('pt-BR') : '—'}
      />
      <InfoRow label="Valor" value={formatCurrency(rec.valor)} />
      <InfoRow
        label="Tipo Doc Fiscal"
        value={rec.documento_fiscal?.tipo?.toUpperCase()}
      />
      {rec.partes?.pagador && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Pagador</p>
          <p className="font-mono text-[11px]">
            {rec.partes.pagador.documento.tipo.toUpperCase()}{' '}
            {formatDocument(rec.partes.pagador.documento.identificador.numero, rec.partes.pagador.documento.tipo)}
          </p>
        </div>
      )}
      {validacaoData.cedente && (
        <div className="space-y-0.5 pt-1">
          <p className="text-muted-foreground text-xs">Cedente</p>
          <p className="font-mono text-[11px]">
            {validacaoData.cedente.documento.tipo.toUpperCase()}{' '}
            {formatDocument(validacaoData.cedente.documento.identificador.numero, validacaoData.cedente.documento.tipo)}
          </p>
          {validacaoData.cedente.nome && <p className="text-xs">{validacaoData.cedente.nome}</p>}
        </div>
      )}
    </div>
  );
}

interface CercResultsPanelProps {
  record: CercValidationRecord | null;
  onRefresh: (id: string) => void;
}

export function CercResultsPanel({ record, onRefresh }: Readonly<CercResultsPanelProps>) {
  const handleRefresh = useCallback(() => {
    if (record?.id) onRefresh(record.id);
  }, [record, onRefresh]);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
        <ShieldCheck size={40} className="text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Preencha o formulário e clique em <strong>Validar Duplicata</strong> para ver os resultados.
        </p>
      </div>
    );
  }

  const isPolling = record.status === 'PENDING' || record.status === 'POLLING';
  const isDone = record.status === 'PROCESSED';
  const isError = record.status === 'ERROR';

  const statusBadgeType = isPolling ? 'neutral' : isDone ? 'success' : 'danger';

  const constatacoes = record.constatacoesDados?.constatacoes ?? [];
  const eventos = record.eventosDados?.eventos ?? [];
  const partes = record.partesDados?.partes ?? null;
  const docFiscal = record.docFiscalDados?.documento_fiscal ?? null;
  const validacaoData = record.validacaoData ?? null;

  const hasDangerConstatacao = constatacoes.some(
    (c) => getConstatacaoSeverity(c.tipo) === 'danger',
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
          {/* Constatações */}
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
            rawData={record.constatacoesDados}
          >
            <ConstatacoesList constatacoes={constatacoes} />
          </ExpandableSection>

          {/* Recebível */}
          {validacaoData && (
            <ExpandableSection
              icon={<Receipt size={15} className="text-blue-500" />}
              title="Recebível"
              defaultOpen={false}
              rawData={record.validacaoData}
            >
              <RecebivelSection validacaoData={validacaoData} />
            </ExpandableSection>
          )}

          {/* Documento Fiscal */}
          {docFiscal && (
            <ExpandableSection
              icon={<FileText size={15} className="text-green-600" />}
              title="Documento Fiscal"
              defaultOpen={false}
              rawData={record.docFiscalDados}
            >
              <DocFiscalSection docFiscal={docFiscal} />
            </ExpandableSection>
          )}

          {/* Partes */}
          {partes && (
            <ExpandableSection
              icon={<Users size={15} className="text-violet-500" />}
              title="Partes"
              defaultOpen={false}
              rawData={record.partesDados}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ParteItem label="Cedente" parte={partes.cedente} />
                <ParteItem label="Originador" parte={partes.originador} />
                <ParteItem label="Pagador" parte={partes.pagador} />
              </div>
            </ExpandableSection>
          )}

          {/* Eventos */}
          <ExpandableSection
            icon={<Activity size={15} className="text-sky-500" />}
            title="Eventos"
            badge={
              eventos.length > 0 ? (
                <StatusBadge value={String(eventos.length)} type="neutral" />
              ) : undefined
            }
            defaultOpen={false}
            rawData={record.eventosDados}
          >
            <EventosList eventos={eventos} />
          </ExpandableSection>

          {/* Request Payload */}
          {record.requestPayload && (
            <ExpandableSection
              icon={<Landmark size={15} className="text-slate-500" />}
              title="Payload Enviado"
              defaultOpen={false}
              rawData={record.requestPayload}
            >
              <p className="text-xs text-muted-foreground">
                Dados exatos enviados para a CERC na criação do lote.
              </p>
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
