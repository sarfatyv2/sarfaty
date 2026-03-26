'use client';

import { useState } from 'react';
import { Card, Badge, ScrollArea } from '@nexus/ui';
import {
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Gavel,
  Database,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  FileText,
} from 'lucide-react';
import type {
  UpminerDossiersDataCadeProcesso,
  UpminerDossiersDataCertidao,
  UpminerDossiersDataSancaoHit,
  UpminerDossiersDataSicaf,
  UpminerDossiersDataMpfProcesso,
  UpminerDossiersDataDjenCitacao,
  UpminerDossiersDataProconAno,
  UpminerDossiersDataReclameAqui,
  UpminerDossiersDataCrsfnAcao,
  UpminerDossiersDataTcuProcesso,
  UpminerDossiersDataContrato,
  UpminerDossiersDataGoogleHit,
} from './upminer.types';
import { CardHeaderSmall } from './upminer.ui';
import { usePagination, PaginationBar } from './upminer.pagination';

// ─── CADE Processo ────────────────────────────────────────────────────────────

export function CadeProcessoItem({ proc }: Readonly<{ proc: UpminerDossiersDataCadeProcesso }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-amber-200/60 dark:border-amber-900/40 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium text-foreground">
            {proc.processo || proc.apiRowId || 'Processo'}
          </span>
          {proc.estado && (
            <Badge variant="outline" className="text-[10px] font-normal border-amber-300 text-amber-700 dark:text-amber-400">
              {proc.estado}
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-amber-200/60 dark:border-amber-900/40 px-3 py-3 space-y-3 text-sm bg-background">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {proc.tipo && (
              <div>
                <p className="text-muted-foreground mb-0.5">Tipo</p>
                <p className="font-medium">{proc.tipo}</p>
              </div>
            )}
            {proc.dataRegistro && (
              <div>
                <p className="text-muted-foreground mb-0.5">Registro</p>
                <p className="font-medium">{proc.dataRegistro}</p>
              </div>
            )}
          </div>
          {proc.resumoInt && (
            <ScrollArea className="max-h-32 rounded border bg-muted/20 p-2 text-xs">{proc.resumoInt}</ScrollArea>
          )}
          {proc.interessados && proc.interessados.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Interessados</p>
              <div className="flex flex-wrap gap-1">
                {proc.interessados.map((it) => (
                  <Badge key={it} variant="outline" className="text-xs font-normal">
                    {it}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {proc.protocolos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Protocolos</p>
              <div className="space-y-1.5">
                {proc.protocolos.map((pr) => (
                  <div key={`${pr.docProcesso ?? 'no-doc'}-${pr.tipoDoc ?? ''}`} className="rounded border border-muted/50 p-2 text-xs flex items-center justify-between gap-2">
                    <span>{pr.tipoDoc} — {pr.docProcesso}</span>
                    {pr.linkPdf && (
                      <a href={pr.linkPdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline shrink-0">
                        <FileText className="h-3 w-3" />PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {proc.andamentos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Andamentos</p>
              <ul className="space-y-1 text-xs">
                {proc.andamentos.map((a, andIdx) => (
                  <li
                    key={`${a.dataHora ?? 'no-date'}-${a.descricao?.slice(0, 30) ?? ''}-${andIdx}`}
                    className="border-l-2 pl-2 border-amber-300 dark:border-amber-700"
                  >
                    {a.dataHora && <span className="text-muted-foreground">{a.dataHora} — </span>}
                    {a.descricao}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Certidões Negativas ──────────────────────────────────────────────────────

const CERTIDAO_LABELS: Record<string, string> = {
  MpfCertidaoNegativa: 'MPF — Certidão Negativa',
  TcuCertidoesInidoneos: 'TCU — Inidôneos',
  CertidaoTJDFT: 'TJDFT — Certidão',
  Tst: 'TST — CNDT',
  BancoDeFalenciasTst: 'TST — Falências',
  CertidaoCadastroNacionalDeCondenacoesCiveis: 'CNJ — Condenações Cíveis',
  CrdaPge: 'SEFAZ — CRDA/PGE',
};

export function CertidoesSection({ certidoes }: Readonly<{ certidoes: UpminerDossiersDataCertidao[] }>) {
  return (
    <Card className="border-emerald-200/70 dark:border-emerald-900/40 overflow-hidden">
      <CardHeaderSmall icon={<ShieldCheck className="h-4 w-4" />} title="Certidões Negativas" variant="success" />
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100 dark:divide-emerald-900/30">
        {certidoes.map((cert, idx) => (
          <div
            key={cert.method}
            className={`px-4 py-3 space-y-1.5 ${idx % 2 === 0 && idx === certidoes.length - 1 ? 'sm:col-span-2' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm font-medium truncate">
                  {CERTIDAO_LABELS[cert.method] ?? cert.method}
                </span>
              </div>
              {cert.pdf && (
                <a
                  href={cert.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary underline shrink-0"
                >
                  <FileText className="h-3 w-3" />PDF
                </a>
              )}
            </div>
            {(cert.dataEmissao || cert.dataValidade || cert.certidaoNumero) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground pl-5">
                {cert.certidaoNumero && <span>Nº {cert.certidaoNumero}</span>}
                {cert.dataEmissao && <span>Emissão: {cert.dataEmissao}</span>}
                {cert.dataValidade && <span>Válida até: {cert.dataValidade}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Sanções e Impedimentos ───────────────────────────────────────────────────

const SANCAO_LABELS: Record<string, string> = {
  ofacInstant: 'OFAC',
  listaOnu: 'Lista ONU',
  worldBank: 'World Bank',
  baseOffshore: 'Offshore / ICIJ',
  informacaoJuridicaDocumento: 'CNJ — Improbidade',
  TransparenciaBrasilCnep: 'CNEP',
  TransparenciaBrasilCeis: 'CEIS',
  TransparenciaBrasilCepim: 'CEPIM',
  EmpresasPunidasSp: 'Empresas Punidas SP',
};

export function SancaoHitsSection({
  hits,
  sicaf,
}: Readonly<{ hits: UpminerDossiersDataSancaoHit[]; sicaf?: UpminerDossiersDataSicaf | null }>) {
  if (hits.length === 0 && !sicaf) return null;

  const methodsWithHits = [...new Set(hits.map((h) => h.method))];
  const hasHighRisk = methodsWithHits.some((m) =>
    ['ofacInstant', 'listaOnu', 'worldBank', 'baseOffshore', 'informacaoJuridicaDocumento'].includes(m),
  );

  return (
    <Card className="border-red-200/70 dark:border-red-900/40 overflow-hidden">
      <CardHeaderSmall
        icon={<ShieldAlert className="h-4 w-4" />}
        title={hits.length > 0 ? `Sanções e Impedimentos — ${hits.length} ocorrência(s)` : 'Sanções e Impedimentos'}
        variant="destructive"
      />

      {hasHighRisk && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Atenção: constam sanções internacionais ou impedimentos críticos
        </div>
      )}

      <div className="px-4 py-3 space-y-3">
        {sicaf && (
          <div className="rounded-md border border-red-200/60 dark:border-red-900/40 p-3 space-y-1.5 bg-red-50/50 dark:bg-red-950/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">SICAF</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{sicaf.razaoSocial ?? sicaf.cnpj}</span>
              {sicaf.situacao && (
                <Badge
                  variant="outline"
                  className={
                    sicaf.situacao.toLowerCase().includes('ido')
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-red-300 bg-red-50 text-red-700'
                  }
                >
                  {sicaf.situacao}
                </Badge>
              )}
            </div>
            {sicaf.situacaoCadastral && (
              <p className="text-xs text-muted-foreground">Situação cadastral: {sicaf.situacaoCadastral}</p>
            )}
          </div>
        )}

        {methodsWithHits.length > 0 && (
          <div className="space-y-2">
            {methodsWithHits.map((method) => {
              const methodHits = hits.filter((h) => h.method === method);
              const isCritical = ['ofacInstant', 'listaOnu', 'worldBank', 'baseOffshore', 'informacaoJuridicaDocumento'].includes(method);
              return (
                <div
                  key={method}
                  className={`rounded-md border p-3 space-y-2 ${
                    isCritical
                      ? 'border-red-400/60 bg-red-50 dark:bg-red-950/20'
                      : 'border-red-200/60 bg-red-50/40 dark:bg-red-950/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${isCritical ? 'text-red-600' : 'text-red-500'}`} />
                    <p className="text-xs font-bold text-red-700 dark:text-red-400">
                      {SANCAO_LABELS[method] ?? method}
                    </p>
                    <Badge className="text-[10px] bg-red-600 text-white px-1.5 py-0 leading-4 ml-auto">
                      {methodHits.length}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {methodHits.map((h, idx) => (
                      <div key={`${method}-${idx}`} className="text-xs border-l-2 border-red-300 dark:border-red-700 pl-2">
                        <span className="font-semibold text-foreground">{h.nome ?? h.cpfCnpj ?? '—'}</span>
                        {h.tipoSancao && <span className="ml-2 text-muted-foreground">({h.tipoSancao})</span>}
                        {h.orgaoSancionador && <span className="ml-2 text-muted-foreground">— {h.orgaoSancionador}</span>}
                        {(h.dataInicio || h.dataFim) && (
                          <p className="text-muted-foreground mt-0.5">
                            {h.dataInicio && `Início: ${h.dataInicio}`}
                            {h.dataInicio && h.dataFim && ' · '}
                            {h.dataFim && `Fim: ${h.dataFim}`}
                          </p>
                        )}
                        {h.fundamentacao && <p className="text-muted-foreground mt-0.5 truncate">{h.fundamentacao}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── MPF Processo Item ────────────────────────────────────────────────────────

export function MpfProcessoItem({ proc }: Readonly<{ proc: UpminerDossiersDataMpfProcesso }>) {
  const [isOpen, setIsOpen] = useState(false);
  const firstDetail = proc.detalhes[0];

  return (
    <div className="rounded-md border border-muted/60 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Scale className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="font-medium truncate">
            {firstDetail?.numProcesso ?? proc.apiId ?? 'Processo'}
          </span>
          {firstDetail?.classe && (
            <Badge variant="outline" className="text-[10px] font-normal shrink-0">
              {firstDetail.classe}
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t px-3 py-3 space-y-3 text-sm">
          {proc.detalhes.map((d, idx) => (
            <div key={`${d.numProcesso ?? idx}`} className="space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {d.orgaoPoder && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Órgão</p>
                    <p className="font-medium">{d.orgaoPoder}</p>
                  </div>
                )}
                {d.classe && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Classe</p>
                    <p className="font-medium">{d.classe}</p>
                  </div>
                )}
                {d.assunto && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-0.5">Assunto</p>
                    <p className="font-medium">{d.assunto}</p>
                  </div>
                )}
                {d.dataAutuacao && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Autuação</p>
                    <p className="font-medium">{d.dataAutuacao}</p>
                  </div>
                )}
              </div>
              {d.partes && d.partes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Partes</p>
                  <ul className="space-y-0.5">
                    {d.partes.map((parte, pi) => (
                      <li key={`${d.numProcesso ?? idx}-parte-${pi}`} className="text-xs border-l-2 pl-2 border-muted">
                        {parte}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DJEN Citação Item ────────────────────────────────────────────────────────

export function DjenCitacaoItem({ cit }: Readonly<{ cit: UpminerDossiersDataDjenCitacao }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-muted/60 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Gavel className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="font-medium truncate">
            {cit.numeroProcessoMascara ?? cit.numeroProcesso ?? 'Citação'}
          </span>
          {cit.tipoComunicacao && (
            <Badge variant="outline" className="text-[10px] font-normal shrink-0">
              {cit.tipoComunicacao}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {cit.data && <span className="text-xs text-muted-foreground">{cit.data}</span>}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="border-t px-3 py-3 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {cit.sigla && (
              <div>
                <p className="text-muted-foreground mb-0.5">Tribunal</p>
                <p className="font-medium">{cit.sigla}</p>
              </div>
            )}
            {cit.nomeClasse && (
              <div>
                <p className="text-muted-foreground mb-0.5">Classe</p>
                <p className="font-medium">{cit.nomeClasse}</p>
              </div>
            )}
            {cit.nomeOrgao && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-0.5">Órgão</p>
                <p className="font-medium">{cit.nomeOrgao}</p>
              </div>
            )}
          </div>
          {cit.link && (
            <a
              href={cit.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary underline"
            >
              <ExternalLink className="h-3 w-3" />Ver publicação
            </a>
          )}
          {cit.texto && (
            <ScrollArea className="max-h-40 rounded border bg-muted/20 p-2 text-xs">{cit.texto}</ScrollArea>
          )}
          {cit.destinatarios.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Destinatários</p>
              <ul className="space-y-0.5">
                {cit.destinatarios.map((d, idx) => (
                  <li key={`dest-${d.nome ?? idx}-${d.tipoDestinatario ?? ''}`} className="text-xs border-l-2 pl-2 border-muted">
                    {d.nome}
                    {d.tipoDestinatario === 'advogado' && d.numeroOab && (
                      <span className="text-muted-foreground ml-1">(OAB {d.ufOab}/{d.numeroOab})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROCON SP ────────────────────────────────────────────────────────────────

export function ProconSpSection({ anos }: Readonly<{ anos: UpminerDossiersDataProconAno[] }>) {
  const totalRec = anos.reduce((acc, a) => acc + a.reclamacoes.length, 0);
  const totalAtendidas = anos.reduce(
    (acc, a) => acc + a.reclamacoes.reduce((s, r) => s + Number.parseInt(r.atendida ?? '0', 10), 0),
    0,
  );
  const totalNaoAtendidas = anos.reduce(
    (acc, a) => acc + a.reclamacoes.reduce((s, r) => s + Number.parseInt(r.naoAtendida ?? '0', 10), 0),
    0,
  );

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<AlertTriangle className="h-4 w-4" />} title="PROCON SP — Reclamações" />
      <div className="px-4 py-3 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md bg-muted/40 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Categorias</p>
            <p className="text-base font-bold">{totalRec}</p>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/20 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Atendidas</p>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{totalAtendidas}</p>
          </div>
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Não atendidas</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400">{totalNaoAtendidas}</p>
          </div>
        </div>

        {anos.map((ano, ai) => (
          <div key={`${ano.ano ?? ai}`} className="rounded-md border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {ano.nomeFantasia ?? ano.razaoSocial} — {ano.ano}
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="pb-1 text-left font-medium">Motivo</th>
                  <th className="pb-1 text-right font-medium w-16">Atend.</th>
                  <th className="pb-1 text-right font-medium w-16">Não at.</th>
                </tr>
              </thead>
              <tbody>
                {ano.reclamacoes.map((r, ri) => (
                  <tr key={`${ai}-${ri}`} className="border-b border-muted/40 last:border-0">
                    <td className="py-1 pr-2">{r.descricao}</td>
                    <td className="py-1 text-right text-emerald-700 dark:text-emerald-400 font-medium">{r.atendida}</td>
                    <td className="py-1 text-right text-red-600 dark:text-red-400 font-medium">{r.naoAtendida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Reclame Aqui ─────────────────────────────────────────────────────────────

export function ReclameAquiSection({ data }: Readonly<{ data: UpminerDossiersDataReclameAqui }>) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? data.reclamacoes : data.reclamacoes.slice(0, 3);

  const reputacaoColor = () => {
    if (!data.classificacao) return 'text-muted-foreground';
    const lower = data.classificacao.toLowerCase();
    if (lower.includes('ótima') || lower.includes('otima') || lower.includes('boa')) return 'text-emerald-700 dark:text-emerald-400';
    if (lower.includes('regular')) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<AlertTriangle className="h-4 w-4" />} title="Reclame Aqui" />
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.classificacao && (
            <div className="rounded-md bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground mb-0.5">Reputação</p>
              <p className={`text-sm font-bold ${reputacaoColor()}`}>{data.classificacao}</p>
            </div>
          )}
          {data.notaConsumidor && (
            <div className="rounded-md bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground mb-0.5">Nota</p>
              <p className="text-sm font-bold">{data.notaConsumidor}</p>
            </div>
          )}
          {data.atendidas && (
            <div className="rounded-md bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground mb-0.5">Atendidas</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{data.atendidas}</p>
            </div>
          )}
          {data.totalReclamacoes && (
            <div className="rounded-md bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground mb-0.5">Total</p>
              <p className="text-sm font-bold">{data.totalReclamacoes}</p>
            </div>
          )}
        </div>

        {data.site && (
          <a href={data.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary underline">
            <ExternalLink className="h-3 w-3" />{data.site}
          </a>
        )}

        {data.reclamacoes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Reclamações recentes</p>
            {displayed.map((rec, idx) => (
              <ScrollArea key={`rec-${rec.slice(0, 30)}-${idx}`} className="max-h-24 rounded border bg-muted/20 p-2 text-xs">
                <p dangerouslySetInnerHTML={{ __html: rec }} />
              </ScrollArea>
            ))}
            {data.reclamacoes.length > 3 && (
              <button
                type="button"
                className="text-xs text-primary underline"
                onClick={() => setShowAll((p) => !p)}
              >
                {showAll ? 'Ver menos' : `Ver mais ${data.reclamacoes.length - 3} reclamações`}
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── CRSFN ────────────────────────────────────────────────────────────────────

const CRSFN_PAGE_SIZE = 5;

export function CrsfnSection({ acoes }: Readonly<{ acoes: UpminerDossiersDataCrsfnAcao[] }>) {
  const pagination = usePagination({ total: acoes.length, pageSize: CRSFN_PAGE_SIZE });
  const page = acoes.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`CRSFN — Ações (${acoes.length})`} variant="destructive" />
      <div className="divide-y">
        {page.map((acao, idx) => (
          <div key={`crsfn-${acao.processo ?? ''}-${pagination.startIndex + idx}`} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{acao.processo ?? '—'}</span>
              {acao.resultado && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    acao.resultado.toLowerCase().includes('provido') || acao.resultado.toLowerCase().includes('condenado')
                      ? 'border-red-300 text-red-700 bg-red-50 dark:bg-red-950/20'
                      : 'border-muted'
                  }`}
                >
                  {acao.resultado}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              {acao.recurso && <span>Recurso: {acao.recurso}</span>}
              {acao.relator && <span>Relator: {acao.relator}</span>}
              {acao.dataJulgamento && <span>Julgamento: {acao.dataJulgamento}</span>}
            </div>
            {acao.ementa && (
              <ScrollArea className="max-h-24 rounded border bg-muted/20 p-2 text-xs">{acao.ementa}</ScrollArea>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={acoes.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}

// ─── TCU ──────────────────────────────────────────────────────────────────────

const TCU_PAGE_SIZE = 5;

export function TcuSection({ processos }: Readonly<{ processos: UpminerDossiersDataTcuProcesso[] }>) {
  const pagination = usePagination({ total: processos.length, pageSize: TCU_PAGE_SIZE });
  const page = processos.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`TCU — Processos (${processos.length})`} variant="destructive" />
      <div className="divide-y">
        {page.map((proc, idx) => (
          <div key={`tcu-${proc.numProcesso ?? ''}-${pagination.startIndex + idx}`} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{proc.numProcesso ?? '—'}</span>
              {proc.situacao && (
                <Badge variant="outline" className="text-xs">{proc.situacao}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              {proc.tipo && <span>Tipo: {proc.tipo}</span>}
              {proc.orgao && <span>Órgão: {proc.orgao}</span>}
              {proc.dataAcordao && <span>Acórdão: {proc.dataAcordao}</span>}
            </div>
            {proc.assunto && <p className="text-xs text-muted-foreground">{proc.assunto}</p>}
            {proc.acordao && (
              <ScrollArea className="max-h-24 rounded border bg-muted/20 p-2 text-xs">{proc.acordao}</ScrollArea>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={processos.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}

// ─── Contratos Públicos ───────────────────────────────────────────────────────

const CONTRATOS_PAGE_SIZE = 10;

export function ContratosSection({ contratos }: Readonly<{ contratos: UpminerDossiersDataContrato[] }>) {
  const pagination = usePagination({ total: contratos.length, pageSize: CONTRATOS_PAGE_SIZE });
  const page = contratos.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<FileText className="h-4 w-4" />} title={`Contratos Públicos (${contratos.length})`} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground bg-muted/20">
              <th className="px-3 py-2 font-medium">Nº Contrato</th>
              <th className="px-3 py-2 font-medium">Órgão</th>
              <th className="px-3 py-2 font-medium">Objeto</th>
              <th className="px-3 py-2 font-medium text-right">Valor</th>
              <th className="px-3 py-2 font-medium">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {page.map((c, idx) => (
              <tr key={`contrato-${c.apiId ?? ''}-${pagination.startIndex + idx}`} className="border-b border-muted/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap font-mono">{c.numeroContrato ?? '—'}</td>
                <td className="px-3 py-2 max-w-[150px] truncate">{c.nomeOrgao ?? c.nomeOrgaoSuperior ?? '—'}</td>
                <td className="px-3 py-2 max-w-[200px] truncate" title={c.objeto ?? undefined}>{c.objeto ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                  {c.valorFinal
                    ? `R$ ${Number.parseFloat(c.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{c.assinaturaContrato ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={contratos.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}

// ─── Google Hits ──────────────────────────────────────────────────────────────

const GOOGLE_PAGE_SIZE = 10;

export function GoogleHitsSection({ hits }: Readonly<{ hits: UpminerDossiersDataGoogleHit[] }>) {
  const pagination = usePagination({ total: hits.length, pageSize: GOOGLE_PAGE_SIZE });
  const page = hits.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Database className="h-4 w-4" />} title={`Google — Resultados (${hits.length})`} />
      <div className="divide-y px-4">
        {page.map((h, idx) => (
          <div key={`google-${h.url ?? h.titulo ?? pagination.startIndex + idx}`} className="py-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {h.pais && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">{h.pais}</Badge>
              )}
              {h.url ? (
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary underline truncate max-w-xs"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {h.titulo ?? h.url}
                </a>
              ) : (
                <span className="text-sm font-medium">{h.titulo ?? '—'}</span>
              )}
            </div>
            {h.snippet && <p className="text-xs text-muted-foreground">{h.snippet}</p>}
          </div>
        ))}
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={hits.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}

// ─── MPF Section wrapper ──────────────────────────────────────────────────────

const MPF_PAGE_SIZE = 5;

export function MpfSection({ processos }: Readonly<{ processos: UpminerDossiersDataMpfProcesso[] }>) {
  const pagination = usePagination({ total: processos.length, pageSize: MPF_PAGE_SIZE });
  const page = processos.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Scale className="h-4 w-4" />} title={`MPF — Processos (${processos.length})`} variant="warning" />
      <div className="px-4 py-3 space-y-2">
        {page.map((proc, idx) => (
          <MpfProcessoItem key={`mpf-${proc.apiId ?? ''}-${pagination.startIndex + idx}`} proc={proc} />
        ))}
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={processos.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}

// ─── DJEN Section wrapper ─────────────────────────────────────────────────────

const DJEN_PAGE_SIZE = 5;

export function DjenSection({ citacoes }: Readonly<{ citacoes: UpminerDossiersDataDjenCitacao[] }>) {
  const pagination = usePagination({ total: citacoes.length, pageSize: DJEN_PAGE_SIZE });
  const page = citacoes.slice(pagination.startIndex, pagination.endIndex);

  return (
    <Card className="overflow-hidden">
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`DJEN — Citações (${citacoes.length})`} variant="warning" />
      <div className="px-4 py-3 space-y-2">
        {page.map((cit, idx) => (
          <DjenCitacaoItem key={`djen-${cit.apiId ?? ''}-${pagination.startIndex + idx}`} cit={cit} />
        ))}
      </div>
      <div className="px-4 pb-3">
        <PaginationBar {...pagination} total={citacoes.length} onPrev={pagination.prev} onNext={pagination.next} onGoTo={pagination.goTo} />
      </div>
    </Card>
  );
}
