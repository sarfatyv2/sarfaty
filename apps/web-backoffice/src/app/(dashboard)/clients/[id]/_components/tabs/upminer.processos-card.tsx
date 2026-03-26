'use client';

import { useState } from 'react';
import { Card, Badge, ScrollArea } from '@nexus/ui';
import { ChevronDown, Gavel } from 'lucide-react';
import type { UpminerProcessoData } from './upminer.types';
import { formatDateShort, formatCurrency, boolLabel } from './upminer.utils';
import { InfoField, CardHeaderSmall, SectionTab } from './upminer.ui';

type ProcessoTab = 'partes' | 'movimentos' | 'assuntos' | 'julgamentos' | 'penhoras';

function ProcessoItem({ processo }: Readonly<{ processo: UpminerProcessoData }>) {
  const [open, setOpen] = useState(false);
  const [innerTab, setInnerTab] = useState<ProcessoTab>('partes');

  const innerTabs: { id: ProcessoTab; label: string }[] = [
    { id: 'partes', label: `Partes (${processo.partes.length})` },
    { id: 'movimentos', label: `Movimentos (${processo.movimentos.length})` },
    { id: 'assuntos', label: `Assuntos (${processo.assuntosCnj.length})` },
    { id: 'julgamentos', label: `Julgamentos (${processo.julgamentos.length})` },
    { id: 'penhoras', label: `Penhoras (${processo.penhoras.length})` },
  ];

  return (
    <div className="rounded-md border border-muted/60">
      <button
        type="button"
        className="flex w-full items-start justify-between px-3 py-2.5 text-left text-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium font-mono text-xs">
              {processo.numeroProcessoUnico || processo.apiProcessoId || 'Processo'}
            </span>
            {processo.tribunal && (
              <Badge variant="outline" className="text-[10px] font-normal">{processo.tribunal}</Badge>
            )}
            {processo.grauProcesso != null && (
              <Badge variant="outline" className="text-[10px] font-normal">{processo.grauProcesso}º grau</Badge>
            )}
            {processo.area && (
              <Badge variant="outline" className="text-[10px] font-normal">{processo.area}</Badge>
            )}
            {processo.statusPredictusStatusProcesso && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                {processo.statusPredictusStatusProcesso}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {processo.dataDistribuicao && <span>Dist.: {formatDateShort(processo.dataDistribuicao)}</span>}
            {processo.classeProcessualNome && <span>{processo.classeProcessualNome}</span>}
            {processo.valorCausaValor && (
              <span>Valor: {formatCurrency(processo.valorCausaMoeda, processo.valorCausaValor)}</span>
            )}
            {processo.orgaoJulgador && <span>{processo.orgaoJulgador}</span>}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 mt-0.5 ml-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t px-3 py-3 space-y-3">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            <InfoField label="Tutela antecipada" value={boolLabel(processo.eTutelaAntecipada)} />
            <InfoField label="Injunção" value={boolLabel(processo.temInjuncao)} />
            <InfoField label="Segredo de justiça" value={boolLabel(processo.eSegredoJustica)} />
            <InfoField label="Acordo" value={boolLabel(processo.temAcordao)} />
            <InfoField label="Sentença" value={boolLabel(processo.temSentenca)} />
          </div>
          {processo.statusPredictusRamoDireito && (
            <InfoField label="Ramo do direito" value={processo.statusPredictusRamoDireito} />
          )}

          <div className="flex flex-wrap gap-1">
            {innerTabs.map((t) => (
              <SectionTab key={t.id} active={innerTab === t.id} label={t.label} onClick={() => setInnerTab(t.id)} />
            ))}
          </div>

          {innerTab === 'partes' && (
            processo.partes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma parte.</p>
            ) : (
              <div className="space-y-2">
                {processo.partes.map((p) => (
                  <div key={p.cpf ?? p.cnpj ?? p.nome ?? 'parte'} className="rounded border border-muted/50 p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{p.nome || '—'}</span>
                      <div className="flex gap-1">
                        {p.polo && <Badge variant="outline" className="text-[10px]">{p.polo}</Badge>}
                        {p.tipo && <Badge variant="outline" className="text-[10px]">{p.tipo}</Badge>}
                      </div>
                    </div>
                    {(p.cpf || p.cnpj) && (
                      <p className="text-muted-foreground font-mono">{p.cpf || p.cnpj}</p>
                    )}
                    {p.advogados.length > 0 && (
                      <div className="pl-2 border-l-2 border-muted mt-1 space-y-0.5">
                        <p className="text-muted-foreground mb-1">Advogados:</p>
                        {p.advogados.map((a) => (
                          <p key={`${a.nome ?? 'adv'}-${a.oabUf ?? ''}-${String(a.oabNumero ?? '')}`}>
                            <span className="font-medium">{a.nome || '—'}</span>
                            {a.oabUf && <span className="text-muted-foreground"> — OAB/{a.oabUf} {a.oabNumero}</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {innerTab === 'movimentos' && (
            processo.movimentos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum movimento.</p>
            ) : (
              <ScrollArea className="max-h-48">
                <ul className="space-y-1 text-xs">
                  {processo.movimentos.map((m) => (
                    <li
                      key={`${m.data ?? 'no-date'}-${String(m.indice ?? m.classificacaoCnjNome ?? '')}`}
                      className="border-l-2 border-muted pl-2"
                    >
                      <span className="text-muted-foreground">{formatDateShort(m.data)}</span>
                      {' — '}
                      {m.classificacaoCnjNome || m.nomeOriginal[0] || '—'}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )
          )}

          {innerTab === 'assuntos' && (
            processo.assuntosCnj.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum assunto.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {processo.assuntosCnj.map((a) => (
                  <li key={a.codigoCnj ?? a.titulo ?? 'assunto'} className="flex items-center gap-2">
                    {a.ePrincipal && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Principal</Badge>}
                    <span>{a.titulo || '—'}</span>
                    {a.codigoCnj && <span className="text-muted-foreground font-mono">(CNJ {a.codigoCnj})</span>}
                  </li>
                ))}
              </ul>
            )
          )}

          {innerTab === 'julgamentos' && (
            processo.julgamentos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum julgamento.</p>
            ) : (
              <div className="space-y-2">
                {processo.julgamentos.map((j) => (
                  <div
                    key={`${j.dataJulgamento ?? 'no-date'}-${j.tipoJulgamento ?? ''}`}
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded border border-muted/50 p-2"
                  >
                    <InfoField label="Data" value={formatDateShort(j.dataJulgamento)} />
                    <InfoField label="Status" value={j.statusJulgamento} />
                    <InfoField label="Tipo" value={j.tipoJulgamento} />
                    <InfoField label="Dias" value={j.diasAteJulgamento === null ? null : String(j.diasAteJulgamento)} />
                  </div>
                ))}
              </div>
            )
          )}

          {innerTab === 'penhoras' && (
            processo.penhoras.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma penhora.</p>
            ) : (
              <div className="space-y-2">
                {processo.penhoras.map((p) => (
                  <div
                    key={`${p.data ?? 'no-date'}-${p.tipo ?? 'no-tipo'}`}
                    className="rounded border border-muted/50 p-2 text-xs space-y-1"
                  >
                    <div className="flex gap-3">
                      <InfoField label="Data" value={formatDateShort(p.data)} />
                      <InfoField label="Tipo" value={p.tipo} />
                    </div>
                    {p.trechoDecisao && (
                      <ScrollArea className="max-h-20 rounded bg-muted/20 p-1.5">
                        {p.trechoDecisao}
                      </ScrollArea>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function ProcessosJudiciaisCard({ processos }: Readonly<{ processos: UpminerProcessoData[] }>) {
  return (
    <Card>
      <CardHeaderSmall icon={<Gavel className="h-4 w-4" />} title={`Processos Judiciais (${processos.length})`} />
      <div className="px-4 pt-3 pb-4 space-y-2">
        {processos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
        ) : (
          processos.map((p) => <ProcessoItem key={p.id} processo={p} />)
        )}
      </div>
    </Card>
  );
}
