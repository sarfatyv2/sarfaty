/** Phase 3 — Processos Administrativos Complexos mapper (MPF, DJEN, PROCON, Reclame Aqui, CRSFN, TCU). */

import { str, strArray, isEmpty, toObj } from './upminer-mapper.utils';

export const MPF_METHOD = 'mpfRelevancia';
export const DJEN_METHOD = 'Djen';
export const PROCON_METHOD = 'proconSp';
export const RECLAME_AQUI_METHOD = 'reclameAqui';
export const CRSFN_METHOD = 'bancoCentralCrsfnEmentasAcordaos';
export const TCU_METHOD = 'tcu';

// ─── Insert shapes ────────────────────────────────────────────────────────────

export interface MpfProcessoInsertShape {
  apiId: string | null;
  nome: string | null;
  estado: string | null;
  detalhes: Array<{
    numProcesso: string | null;
    partes: string[] | null;
    orgaoPoder: string | null;
    vara: string | null;
    localizacaoAtual: string | null;
    classe: string | null;
    camara: string | null;
    dataAutuacao: string | null;
    assunto: string | null;
    distribuicao: string | null;
  }>;
}

export interface DjenCitacaoInsertShape {
  apiId: string | null;
  estado: string | null;
  data: string | null;
  sigla: string | null;
  tipoComunicacao: string | null;
  nomeOrgao: string | null;
  tipoDocumento: string | null;
  nomeClasse: string | null;
  numeroProcesso: string | null;
  numeroProcessoMascara: string | null;
  link: string | null;
  texto: string | null;
  destinatarios: Array<{
    nome: string | null;
    tipoDestinatario: string | null;
    numeroOab: string | null;
    ufOab: string | null;
  }>;
}

export interface ProconAnoInsertShape {
  nomeFantasia: string | null;
  razaoSocial: string | null;
  ano: string | null;
  reclamacoes: Array<{ descricao: string | null; atendida: string | null; naoAtendida: string | null }>;
}

export interface ReclameAquiInsertShape {
  empresa: string | null;
  dataCadastro: string | null;
  site: string | null;
  telefone: string | null;
  classificacao: string | null;
  atendidas: string | null;
  solucao: string | null;
  voltaria: string | null;
  notaConsumidor: string | null;
  tempoMedioResposta: string | null;
  totalAtendidas: string | null;
  totalNaoAtendidas: string | null;
  totalReclamacoes: string | null;
  reclamacoes: string[];
}

export interface CrsfnAcaoInsertShape {
  processo: string | null;
  ementa: string | null;
  dataJulgamento: string | null;
  resultado: string | null;
  relator: string | null;
  recurso: string | null;
}

export interface TcuProcessoInsertShape {
  numProcesso: string | null;
  tipo: string | null;
  assunto: string | null;
  situacao: string | null;
  orgao: string | null;
  acordao: string | null;
  dataAcordao: string | null;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function parseMpfDetalhe(d: Record<string, unknown>): MpfProcessoInsertShape['detalhes'][number] {
  return {
    numProcesso: str(d.num_processo),
    partes: strArray(d.partes),
    orgaoPoder: str(d.orgao_do_poder_judiciario),
    vara: str(d.vara),
    localizacaoAtual: str(d.localizacao_atual),
    classe: str(d.classe),
    camara: str(d.camara),
    dataAutuacao: str(d.data_de_autuacao),
    assunto: str(d.assunto),
    distribuicao: str(d.distribuicao),
  };
}

function parseDjenDestinatario(
  dest: Record<string, unknown>,
  isAdvogado: boolean,
): DjenCitacaoInsertShape['destinatarios'][number] {
  return {
    nome: str(isAdvogado ? dest.nomeAdvogado : dest.nome),
    tipoDestinatario: isAdvogado ? 'advogado' : 'parte',
    numeroOab: isAdvogado ? str(dest.numeroOab) : null,
    ufOab: isAdvogado ? str(dest.ufOab) : null,
  };
}

// ─── Parse functions ──────────────────────────────────────────────────────────

export function parseMpfRelevancia(payload: unknown): MpfProcessoInsertShape[] {
  if (!Array.isArray(payload)) return [];
  const out: MpfProcessoInsertShape[] = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const detalhesRaw = Array.isArray(o.detalhes) ? o.detalhes : [];
    const detalhes = detalhesRaw
      .filter((d): d is Record<string, unknown> => d !== null && typeof d === 'object')
      .map(parseMpfDetalhe);
    out.push({ apiId: str(o.id), nome: str(o.nome), estado: str(o.estado), detalhes });
  }
  return out;
}

function parseDjenRow(r: Record<string, unknown>): DjenCitacaoInsertShape {
  const dado = toObj(r.dado);
  const destinatarios: DjenCitacaoInsertShape['destinatarios'] = [];
  if (Array.isArray(dado.destinatarios)) {
    for (const d of dado.destinatarios) {
      if (d && typeof d === 'object') destinatarios.push(parseDjenDestinatario(d as Record<string, unknown>, false));
    }
  }
  if (Array.isArray(dado.destinatarioadvogados)) {
    for (const d of dado.destinatarioadvogados) {
      if (d && typeof d === 'object') destinatarios.push(parseDjenDestinatario(d as Record<string, unknown>, true));
    }
  }
  return {
    apiId: str(r.id),
    estado: str(r.estado),
    data: str(dado.data),
    sigla: str(dado.sigla),
    tipoComunicacao: str(dado.tipoComunicacao),
    nomeOrgao: str(dado.nomeOrgao),
    tipoDocumento: str(dado.tipoDocumento),
    nomeClasse: str(dado.nomeClasse),
    numeroProcesso: str(dado.numero_processo),
    numeroProcessoMascara: str(dado.numeroprocessocommascara),
    link: str(dado.link),
    texto: str(dado.texto),
    destinatarios,
  };
}

export function parseDjen(payload: unknown): DjenCitacaoInsertShape[] {
  if (isEmpty(payload)) return [];
  const o = toObj(payload);
  const dados = Array.isArray(o.dados) ? o.dados : [];
  return dados
    .filter((row): row is Record<string, unknown> => row !== null && typeof row === 'object')
    .map(parseDjenRow);
}

export function parseProconSp(payload: unknown): ProconAnoInsertShape[] {
  if (!Array.isArray(payload)) return [];
  const out: ProconAnoInsertShape[] = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const reclamacoes: ProconAnoInsertShape['reclamacoes'] = [];
    if (Array.isArray(o.aReclamacao)) {
      for (const rec of o.aReclamacao) {
        if (!rec || typeof rec !== 'object') continue;
        const r = rec as Record<string, unknown>;
        reclamacoes.push({ descricao: str(r.descricao), atendida: str(r.atendida), naoAtendida: str(r.nao_atendida) });
      }
    }
    out.push({ nomeFantasia: str(o.nome_fantasia), razaoSocial: str(o.razao_social), ano: str(o.ano), reclamacoes });
  }
  return out;
}

export function parseReclameAqui(payload: unknown): ReclameAquiInsertShape | null {
  if (isEmpty(payload)) return null;
  const o = toObj(payload);
  const ident = toObj(o.identificacao);
  const rep = toObj(o.reputacao);
  const aval = toObj(o.avaliacao);
  const reclamacoes = Array.isArray(o.reclamacao)
    ? o.reclamacao.filter((x): x is string => typeof x === 'string')
    : [];
  return {
    empresa: str(ident.empresa),
    dataCadastro: str(ident.data_cadastro),
    site: str(ident.site),
    telefone: str(ident.telefone),
    classificacao: str(rep.classificacao),
    atendidas: str(rep.atendidas),
    solucao: str(rep.solucao),
    voltaria: str(rep.voltaria),
    notaConsumidor: str(aval.nota_consumidor),
    tempoMedioResposta: str(aval.tempo_medio_resposta),
    totalAtendidas: str(aval.atendidas),
    totalNaoAtendidas: str(aval.nao_atendidas),
    totalReclamacoes: str(aval.total),
    reclamacoes,
  };
}

export function parseCrsfn(payload: unknown): CrsfnAcaoInsertShape[] {
  if (isEmpty(payload)) return [];
  const rows = Array.isArray(payload) ? payload : (toObj(payload).items as unknown[]) ?? [];
  if (!Array.isArray(rows)) return [];
  const out: CrsfnAcaoInsertShape[] = [];
  for (const item of rows) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    out.push({
      processo: str(o.processo) ?? str(o.num_processo) ?? null,
      ementa: str(o.ementa) ?? str(o.descricao) ?? null,
      dataJulgamento: str(o.data_julgamento) ?? str(o.data) ?? null,
      resultado: str(o.resultado) ?? str(o.situacao) ?? null,
      relator: str(o.relator) ?? null,
      recurso: str(o.recurso) ?? str(o.tipo) ?? null,
    });
  }
  return out;
}

export function parseTcu(payload: unknown): TcuProcessoInsertShape[] {
  if (isEmpty(payload)) return [];
  const rows = Array.isArray(payload) ? payload : (toObj(payload).items as unknown[]) ?? [];
  if (!Array.isArray(rows)) return [];
  const out: TcuProcessoInsertShape[] = [];
  for (const item of rows) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    out.push({
      numProcesso: str(o.num_processo) ?? str(o.numero) ?? null,
      tipo: str(o.tipo) ?? null,
      assunto: str(o.assunto) ?? null,
      situacao: str(o.situacao) ?? null,
      orgao: str(o.orgao) ?? null,
      acordao: str(o.acordao) ?? str(o.numero_acordao) ?? null,
      dataAcordao: str(o.data_acordao) ?? str(o.data) ?? null,
    });
  }
  return out;
}
