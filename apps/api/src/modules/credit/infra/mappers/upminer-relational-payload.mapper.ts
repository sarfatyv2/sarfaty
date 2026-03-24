/**
 * Maps upMiner API JSON bodies from GET .../dossiers/{id}/sources/{method} into Drizzle insert shapes.
 */

const RECEITA_METHOD = 'receitaFederalPj';
const QSA_METHOD = 'baseEmpresas';
const CADE_METHOD = 'cade';

function stringifyOptional(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

export interface ReceitaFederalPjInsertShape {
  cnpj: string | null;
  tipo: string | null;
  dataAbertura: string | null;
  nomeEmpresarial: string | null;
  nomeFantasia: string | null;
  atividadeEconomicaPrincipal: string | null;
}

export interface ReceitaSecundariaInsertShape {
  codigo: string | null;
  descricao: string | null;
  ordem: number;
}

export interface QsaInsertShape {
  cnpj: string | null;
  razaoSocial: string | null;
  capitalSocial: string | null;
  dataConsulta: string | null;
  pep: string | null;
}

export interface QsaSocioInsertShape {
  cpfCnpj: string | null;
  nome: string | null;
  entrada: string | null;
  qualificacao: string | null;
  participacao: string | null;
  situacao: string | null;
  pep: string | null;
  tipoSocio: string | null;
}

export interface CadeProcessoInsertShape {
  apiRowId: string | null;
  estado: string | null;
  processo: string | null;
  tipo: string | null;
  dataRegistro: string | null;
  resumoInt: string | null;
  interessados: string[] | null;
  protocolos: Array<{
    docProcesso: string | null;
    tipoDoc: string | null;
    dataDocumento: string | null;
    dataRegistro: string | null;
    unidade: string | null;
    linkPdf: string | null;
  }>;
  andamentos: Array<{
    dataHora: string | null;
    unidade: string | null;
    descricao: string | null;
  }>;
}

function parseCadeProtocolo(p: Record<string, unknown>): CadeProcessoInsertShape['protocolos'][number] {
  return {
    docProcesso: typeof p.doc_processo === 'string' ? p.doc_processo : null,
    tipoDoc: typeof p.tipo_doc === 'string' ? p.tipo_doc : null,
    dataDocumento: typeof p.data_documento === 'string' ? p.data_documento : null,
    dataRegistro: typeof p.data_registro === 'string' ? p.data_registro : null,
    unidade: typeof p.unidade === 'string' ? p.unidade : null,
    linkPdf: typeof p.link_pdf === 'string' ? p.link_pdf : null,
  };
}

function parseCadeAndamento(a: Record<string, unknown>): CadeProcessoInsertShape['andamentos'][number] {
  return {
    dataHora: typeof a.data_hora === 'string' ? a.data_hora : null,
    unidade: typeof a.unidade === 'string' ? a.unidade : null,
    descricao: typeof a.descricao === 'string' ? a.descricao : null,
  };
}

function parseCadeOneItem(item: Record<string, unknown>): CadeProcessoInsertShape {
  const dados =
    item.dados && typeof item.dados === 'object' && !Array.isArray(item.dados)
      ? (item.dados as Record<string, unknown>)
      : {};
  const autuacao =
    dados.autuacao && typeof dados.autuacao === 'object' && !Array.isArray(dados.autuacao)
      ? (dados.autuacao as Record<string, unknown>)
      : {};

  const interessadosRaw = autuacao.interessados;
  let interessados: string[] | null = null;
  if (Array.isArray(interessadosRaw)) {
    interessados = interessadosRaw.filter((x): x is string => typeof x === 'string');
  }

  const protocolos: CadeProcessoInsertShape['protocolos'] = [];
  if (Array.isArray(dados.protocolos)) {
    for (const p of dados.protocolos) {
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        protocolos.push(parseCadeProtocolo(p as Record<string, unknown>));
      }
    }
  }

  const andamentos: CadeProcessoInsertShape['andamentos'] = [];
  if (Array.isArray(dados.andamentos)) {
    for (const a of dados.andamentos) {
      if (a && typeof a === 'object' && !Array.isArray(a)) {
        andamentos.push(parseCadeAndamento(a as Record<string, unknown>));
      }
    }
  }

  let apiRowId: string | null = null;
  if (typeof item.id === 'string') {
    apiRowId = item.id;
  } else if (item.id != null && (typeof item.id === 'number' || typeof item.id === 'boolean')) {
    apiRowId = String(item.id);
  }

  return {
    apiRowId,
    estado: typeof item.estado === 'string' ? item.estado : null,
    processo: typeof autuacao.processo === 'string' ? autuacao.processo : null,
    tipo: typeof autuacao.tipo === 'string' ? autuacao.tipo : null,
    dataRegistro: typeof autuacao.data_registro === 'string' ? autuacao.data_registro : null,
    resumoInt: typeof autuacao.resumo_int === 'string' ? autuacao.resumo_int : null,
    interessados,
    protocolos,
    andamentos,
  };
}

export class UpminerRelationalPayloadMapper {
  static parseReceitaFederalPj(payload: unknown): {
    receita: ReceitaFederalPjInsertShape;
    secundarias: ReceitaSecundariaInsertShape[];
  } | null {
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const o = payload as Record<string, unknown>;
    const receita: ReceitaFederalPjInsertShape = {
      cnpj: typeof o.cnpj === 'string' ? o.cnpj : null,
      tipo: typeof o.tipo === 'string' ? o.tipo : null,
      dataAbertura: typeof o.data_abertura === 'string' ? o.data_abertura : null,
      nomeEmpresarial: typeof o.nome_empresarial === 'string' ? o.nome_empresarial : null,
      nomeFantasia: typeof o.nome_fantasia === 'string' ? o.nome_fantasia : null,
      atividadeEconomicaPrincipal:
        typeof o.atividade_economica_principal === 'string' ? o.atividade_economica_principal : null,
    };
    const secundarias: ReceitaSecundariaInsertShape[] = [];
    const rawSec = o.aAtividadeSecundaria;
    if (Array.isArray(rawSec)) {
      rawSec.forEach((row, idx) => {
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          const r = row as Record<string, unknown>;
          secundarias.push({
            codigo: typeof r.codigo === 'string' ? r.codigo : null,
            descricao: typeof r.descricao === 'string' ? r.descricao : null,
            ordem: idx,
          });
        }
      });
    }
    return { receita, secundarias };
  }

  static parseBaseEmpresas(payload: unknown): {
    qsa: QsaInsertShape;
    socios: QsaSocioInsertShape[];
  } | null {
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const o = payload as Record<string, unknown>;
    const qsa: QsaInsertShape = {
      cnpj: typeof o.cnpj === 'string' ? o.cnpj : null,
      razaoSocial: typeof o.razao_social === 'string' ? o.razao_social : null,
      capitalSocial: typeof o.capital_social === 'string' ? o.capital_social : null,
      dataConsulta: typeof o.data_consulta === 'string' ? o.data_consulta : null,
      pep: stringifyOptional(o.pep),
    };
    const socios: QsaSocioInsertShape[] = [];
    const rawSoc = o.aSocio;
    if (Array.isArray(rawSoc)) {
      for (const row of rawSoc) {
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          const r = row as Record<string, unknown>;
          socios.push({
            cpfCnpj: typeof r.cpf_cnpj === 'string' ? r.cpf_cnpj : null,
            nome: typeof r.nome === 'string' ? r.nome : null,
            entrada: typeof r.entrada === 'string' ? r.entrada : null,
            qualificacao: typeof r.qualificacao === 'string' ? r.qualificacao : null,
            participacao: typeof r.participacao === 'string' ? r.participacao : null,
            situacao: typeof r.situacao === 'string' ? r.situacao : null,
            pep: stringifyOptional(r.pep),
            tipoSocio: typeof r.tipo_socio === 'string' ? r.tipo_socio : null,
          });
        }
      }
    }
    return { qsa, socios };
  }

  static parseCade(payload: unknown): CadeProcessoInsertShape[] {
    if (!Array.isArray(payload)) return [];
    const out: CadeProcessoInsertShape[] = [];
    for (const item of payload) {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) continue;
      out.push(parseCadeOneItem(item as Record<string, unknown>));
    }
    return out;
  }

  static readonly METHOD_RECEITA = RECEITA_METHOD;
  static readonly METHOD_QSA = QSA_METHOD;
  static readonly METHOD_CADE = CADE_METHOD;
}
