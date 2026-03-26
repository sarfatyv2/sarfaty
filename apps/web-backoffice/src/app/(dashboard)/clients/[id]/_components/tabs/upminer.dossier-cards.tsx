'use client';

import { useState } from 'react';
import { Card, Badge, ScrollArea } from '@nexus/ui';
import { ChevronDown, CheckCircle2, AlertTriangle, Scale, Gavel, Database } from 'lucide-react';
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

// ─── CADE Processo ────────────────────────────────────────────────────────────

export function CadeProcessoItem({ proc }: Readonly<{ proc: UpminerDossiersDataCadeProcesso }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-muted/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-medium">
          {proc.processo || proc.apiRowId || 'Processo'}
          {proc.estado && (
            <span className="text-muted-foreground font-normal ml-2">{proc.estado}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t px-3 py-3 space-y-3 text-sm">
          {proc.tipo && <p><span className="text-muted-foreground">Tipo:</span> {proc.tipo}</p>}
          {proc.dataRegistro && <p><span className="text-muted-foreground">Registro:</span> {proc.dataRegistro}</p>}
          {proc.resumoInt && (
            <ScrollArea className="max-h-32 rounded border bg-muted/20 p-2 text-xs">{proc.resumoInt}</ScrollArea>
          )}
          {proc.interessados && proc.interessados.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interessados</p>
              <ul className="list-disc pl-4 text-xs">
                {proc.interessados.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          )}
          {proc.protocolos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Protocolos</p>
              <div className="space-y-2">
                {proc.protocolos.map((pr) => (
                  <div key={`${pr.docProcesso ?? 'no-doc'}-${pr.tipoDoc ?? ''}`} className="rounded border border-muted/50 p-2 text-xs">
                    <p>{pr.tipoDoc} — {pr.docProcesso}</p>
                    {pr.linkPdf && (
                      <a href={pr.linkPdf} target="_blank" rel="noopener noreferrer" className="text-primary underline">PDF</a>
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
                    className="border-l-2 pl-2 border-muted"
                  >
                    <span className="text-muted-foreground">{a.dataHora}</span> — {a.descricao}
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

// ─── Phase 1: Certidões ───────────────────────────────────────────────────────

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
    <Card>
      <CardHeaderSmall icon={<CheckCircle2 className="h-4 w-4" />} title="Certidões Negativas" />
      <div className="divide-y">
        {certidoes.map((cert) => (
          <div key={cert.method} className="px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{CERTIDAO_LABELS[cert.method] ?? cert.method}</span>
              {cert.pdf && (
                <a href={cert.pdf} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                  PDF
                </a>
              )}
            </div>
            {(cert.dataEmissao || cert.dataValidade || cert.certidaoNumero) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {cert.certidaoNumero && <span>Nº {cert.certidaoNumero}</span>}
                {cert.dataEmissao && <span>Emissão: {cert.dataEmissao}</span>}
                {cert.dataValidade && <span>Validade: {cert.dataValidade}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Phase 2: Sanções e Impedimentos ─────────────────────────────────────────

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

  return (
    <Card>
      <CardHeaderSmall icon={<AlertTriangle className="h-4 w-4" />} title="Sanções e Impedimentos" />
      <div className="px-4 py-3 space-y-3">
        {sicaf && (
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SICAF</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{sicaf.razaoSocial ?? sicaf.cnpj}</span>
              {sicaf.situacao && (
                <Badge variant={sicaf.situacao.toLowerCase().includes('ido') ? 'default' : 'destructive'}>
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
              return (
                <div key={method} className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                  <p className="text-xs font-semibold text-destructive mb-2">
                    {SANCAO_LABELS[method] ?? method} — {methodHits.length} ocorrência(s)
                  </p>
                  <div className="space-y-1">
                    {methodHits.map((h, idx) => (
                      <div key={`${method}-${idx}`} className="text-xs text-foreground/80">
                        <span className="font-medium">{h.nome ?? h.cpfCnpj ?? '—'}</span>
                        {h.tipoSancao && <span className="ml-2 text-muted-foreground">({h.tipoSancao})</span>}
                        {h.orgaoSancionador && <span className="ml-2 text-muted-foreground">— {h.orgaoSancionador}</span>}
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

// ─── Phase 3: MPF Processos ───────────────────────────────────────────────────

export function MpfProcessoItem({ proc }: Readonly<{ proc: UpminerDossiersDataMpfProcesso }>) {
  const [isOpen, setIsOpen] = useState(false);
  const firstDetail = proc.detalhes[0];

  return (
    <div className="rounded-md border border-muted/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-medium">
          {firstDetail?.numProcesso ?? proc.apiId ?? 'Processo'}
          {firstDetail?.classe && (
            <span className="text-muted-foreground font-normal ml-2 text-xs">{firstDetail.classe}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t px-3 py-3 space-y-3 text-sm">
          {proc.detalhes.map((d, idx) => (
            <div key={`${d.numProcesso ?? idx}`} className="space-y-1.5">
              {d.orgaoPoder && <p><span className="text-muted-foreground">Órgão:</span> {d.orgaoPoder}</p>}
              {d.classe && <p><span className="text-muted-foreground">Classe:</span> {d.classe}</p>}
              {d.assunto && <p><span className="text-muted-foreground">Assunto:</span> {d.assunto}</p>}
              {d.dataAutuacao && <p><span className="text-muted-foreground">Autuação:</span> {d.dataAutuacao}</p>}
              {d.partes && d.partes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Partes:</p>
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

// ─── Phase 3: DJEN Citações ───────────────────────────────────────────────────

export function DjenCitacaoItem({ cit }: Readonly<{ cit: UpminerDossiersDataDjenCitacao }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-md border border-muted/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-medium">
          {cit.numeroProcessoMascara ?? cit.numeroProcesso ?? 'Citação'}
          {cit.tipoComunicacao && (
            <span className="text-muted-foreground font-normal ml-2 text-xs">{cit.tipoComunicacao}</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {cit.data && <span className="text-xs text-muted-foreground">{cit.data}</span>}
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="border-t px-3 py-3 space-y-3 text-sm">
          {cit.sigla && <p><span className="text-muted-foreground">Tribunal:</span> {cit.sigla}</p>}
          {cit.nomeClasse && <p><span className="text-muted-foreground">Classe:</span> {cit.nomeClasse}</p>}
          {cit.nomeOrgao && <p><span className="text-muted-foreground">Órgão:</span> {cit.nomeOrgao}</p>}
          {cit.link && (
            <a href={cit.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline block">
              Ver publicação
            </a>
          )}
          {cit.texto && (
            <ScrollArea className="max-h-40 rounded border bg-muted/20 p-2 text-xs">{cit.texto}</ScrollArea>
          )}
          {cit.destinatarios.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Destinatários:</p>
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

// ─── Phase 3: PROCON SP ───────────────────────────────────────────────────────

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
    <Card>
      <CardHeaderSmall icon={<AlertTriangle className="h-4 w-4" />} title="PROCON SP — Reclamações" />
      <div className="px-4 py-3 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-muted-foreground">Total categorias: <strong className="text-foreground">{totalRec}</strong></span>
          <span className="text-green-600">Atendidas: <strong>{totalAtendidas}</strong></span>
          <span className="text-destructive">Não atendidas: <strong>{totalNaoAtendidas}</strong></span>
        </div>
        {anos.map((ano, ai) => (
          <div key={`${ano.ano ?? ai}`} className="rounded-md border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{ano.nomeFantasia ?? ano.razaoSocial} — {ano.ano}</p>
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
                    <td className="py-1 text-right text-green-600">{r.atendida}</td>
                    <td className="py-1 text-right text-destructive">{r.naoAtendida}</td>
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

// ─── Phase 3: Reclame Aqui ────────────────────────────────────────────────────

export function ReclameAquiSection({ data }: Readonly<{ data: UpminerDossiersDataReclameAqui }>) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? data.reclamacoes : data.reclamacoes.slice(0, 3);

  return (
    <Card>
      <CardHeaderSmall icon={<AlertTriangle className="h-4 w-4" />} title="Reclame Aqui" />
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {data.classificacao && (
            <div>
              <p className="text-xs text-muted-foreground">Reputação</p>
              <p className="font-medium">{data.classificacao}</p>
            </div>
          )}
          {data.notaConsumidor && (
            <div>
              <p className="text-xs text-muted-foreground">Nota consumidor</p>
              <p className="font-medium">{data.notaConsumidor}</p>
            </div>
          )}
          {data.atendidas && (
            <div>
              <p className="text-xs text-muted-foreground">Atendidas</p>
              <p className="font-medium">{data.atendidas}</p>
            </div>
          )}
          {data.totalReclamacoes && (
            <div>
              <p className="text-xs text-muted-foreground">Total reclamações</p>
              <p className="font-medium">{data.totalReclamacoes}</p>
            </div>
          )}
        </div>
        {data.reclamacoes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Reclamações recentes:</p>
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
        {data.site && (
          <a href={data.site} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline block">
            {data.site}
          </a>
        )}
      </div>
    </Card>
  );
}

// ─── Phase 3: CRSFN ───────────────────────────────────────────────────────────

export function CrsfnSection({ acoes }: Readonly<{ acoes: UpminerDossiersDataCrsfnAcao[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`CRSFN — Ações (${acoes.length})`} />
      <div className="divide-y">
        {acoes.map((acao, idx) => (
          <div key={`crsfn-${acao.processo ?? ''}-${idx}`} className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{acao.processo ?? '—'}</span>
              {acao.resultado && <Badge variant="outline" className="text-xs">{acao.resultado}</Badge>}
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
    </Card>
  );
}

// ─── Phase 3: TCU ─────────────────────────────────────────────────────────────

export function TcuSection({ processos }: Readonly<{ processos: UpminerDossiersDataTcuProcesso[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`TCU — Processos (${processos.length})`} />
      <div className="divide-y">
        {processos.map((proc, idx) => (
          <div key={`tcu-${proc.numProcesso ?? ''}-${idx}`} className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{proc.numProcesso ?? '—'}</span>
              {proc.situacao && <Badge variant="outline" className="text-xs">{proc.situacao}</Badge>}
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
    </Card>
  );
}

// ─── Phase 4: Contratos Públicos ──────────────────────────────────────────────

export function ContratosSection({ contratos }: Readonly<{ contratos: UpminerDossiersDataContrato[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`Contratos Públicos (${contratos.length})`} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-3 py-2">Nº Contrato</th>
              <th className="px-3 py-2">Órgão</th>
              <th className="px-3 py-2">Objeto</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c, idx) => (
              <tr key={`contrato-${c.apiId ?? ''}-${idx}`} className="border-b border-muted/40 last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 whitespace-nowrap">{c.numeroContrato ?? '—'}</td>
                <td className="px-3 py-2 max-w-[150px] truncate">{c.nomeOrgao ?? c.nomeOrgaoSuperior ?? '—'}</td>
                <td className="px-3 py-2 max-w-[200px] truncate" title={c.objeto ?? undefined}>{c.objeto ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
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
    </Card>
  );
}

// ─── Phase 4: Google Hits ─────────────────────────────────────────────────────

export function GoogleHitsSection({ hits }: Readonly<{ hits: UpminerDossiersDataGoogleHit[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Database className="h-4 w-4" />} title={`Google — Resultados (${hits.length})`} />
      <div className="divide-y px-4">
        {hits.map((h, idx) => (
          <div key={`google-${h.url ?? h.titulo ?? idx}`} className="py-3 space-y-0.5">
            <div className="flex items-center gap-2">
              {h.pais && <Badge variant="outline" className="text-xs py-0">{h.pais}</Badge>}
              {h.url ? (
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline truncate max-w-xs">
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
    </Card>
  );
}

// ─── MPF Processos card wrapper ───────────────────────────────────────────────

export function MpfSection({ processos }: Readonly<{ processos: UpminerDossiersDataMpfProcesso[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Scale className="h-4 w-4" />} title={`MPF — Processos (${processos.length})`} />
      <div className="px-4 pb-4 space-y-3">
        {processos.map((proc, idx) => (
          <MpfProcessoItem key={`mpf-${proc.apiId ?? ''}-${idx}`} proc={proc} />
        ))}
      </div>
    </Card>
  );
}

// ─── DJEN Citações card wrapper ───────────────────────────────────────────────

export function DjenSection({ citacoes }: Readonly<{ citacoes: UpminerDossiersDataDjenCitacao[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Scale className="h-4 w-4" />} title={`DJEN — Citações (${citacoes.length})`} />
      <div className="px-4 pb-4 space-y-3">
        {citacoes.map((cit, idx) => (
          <DjenCitacaoItem key={`djen-${cit.apiId ?? ''}-${idx}`} cit={cit} />
        ))}
      </div>
    </Card>
  );
}
