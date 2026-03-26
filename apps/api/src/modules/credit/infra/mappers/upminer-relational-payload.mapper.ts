/**
 * Facade that re-exports all upMiner dossier mapper shapes and delegates to
 * the phase-specific sub-mappers.  Importers only need this one file.
 */

import { str } from './upminer-mapper.utils';
import { parseCertidao } from './upminer-certidoes.mapper';
import { parseSancaoHits, parseSicaf } from './upminer-sancoes.mapper';
import {
  parseMpfRelevancia,
  parseDjen,
  parseProconSp,
  parseReclameAqui,
  parseCrsfn,
  parseTcu,
} from './upminer-adm-processos.mapper';
import { parseContratos, parseGoogleGlobal } from './upminer-especiais.mapper';

// ─── Re-export shapes so existing consumers can keep their import path ────────

export type { CertidaoInsertShape } from './upminer-certidoes.mapper';
export type { SancaoHitInsertShape, SicafInsertShape } from './upminer-sancoes.mapper';
export type {
  MpfProcessoInsertShape,
  DjenCitacaoInsertShape,
  ProconAnoInsertShape,
  ReclameAquiInsertShape,
  CrsfnAcaoInsertShape,
  TcuProcessoInsertShape,
} from './upminer-adm-processos.mapper';
export type { ContratoInsertShape, GoogleHitInsertShape } from './upminer-especiais.mapper';

// ─── Core insert shapes (Receita Federal / QSA / CADE) ───────────────────────

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

// ─── CADE private helpers ─────────────────────────────────────────────────────

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

function extractCadeDados(item: Record<string, unknown>): Record<string, unknown> {
  return item.dados && typeof item.dados === 'object' && !Array.isArray(item.dados)
    ? (item.dados as Record<string, unknown>)
    : {};
}

function extractCadeAuuacao(dados: Record<string, unknown>): Record<string, unknown> {
  return dados.autuacao && typeof dados.autuacao === 'object' && !Array.isArray(dados.autuacao)
    ? (dados.autuacao as Record<string, unknown>)
    : {};
}

function extractCadeInteressados(autuacao: Record<string, unknown>): string[] | null {
  if (!Array.isArray(autuacao.interessados)) return null;
  const filtered = autuacao.interessados.filter((x): x is string => typeof x === 'string');
  return filtered.length > 0 ? filtered : null;
}

function extractCadeProtocolos(dados: Record<string, unknown>): CadeProcessoInsertShape['protocolos'] {
  if (!Array.isArray(dados.protocolos)) return [];
  return dados.protocolos
    .filter((p): p is Record<string, unknown> => p !== null && typeof p === 'object' && !Array.isArray(p))
    .map(parseCadeProtocolo);
}

function extractCadeAndamentos(dados: Record<string, unknown>): CadeProcessoInsertShape['andamentos'] {
  if (!Array.isArray(dados.andamentos)) return [];
  return dados.andamentos
    .filter((a): a is Record<string, unknown> => a !== null && typeof a === 'object' && !Array.isArray(a))
    .map(parseCadeAndamento);
}

function extractCadeApiRowId(item: Record<string, unknown>): string | null {
  if (typeof item.id === 'string') return item.id;
  if (item.id != null && (typeof item.id === 'number' || typeof item.id === 'boolean')) return String(item.id);
  return null;
}

function parseCadeOneItem(item: Record<string, unknown>): CadeProcessoInsertShape {
  const dados = extractCadeDados(item);
  const autuacao = extractCadeAuuacao(dados);
  return {
    apiRowId: extractCadeApiRowId(item),
    estado: typeof item.estado === 'string' ? item.estado : null,
    processo: typeof autuacao.processo === 'string' ? autuacao.processo : null,
    tipo: typeof autuacao.tipo === 'string' ? autuacao.tipo : null,
    dataRegistro: typeof autuacao.data_registro === 'string' ? autuacao.data_registro : null,
    resumoInt: typeof autuacao.resumo_int === 'string' ? autuacao.resumo_int : null,
    interessados: extractCadeInteressados(autuacao),
    protocolos: extractCadeProtocolos(dados),
    andamentos: extractCadeAndamentos(dados),
  };
}

// ─── QSA private helper ───────────────────────────────────────────────────────

function parseQsaSocios(rawSoc: unknown): QsaSocioInsertShape[] {
  if (!Array.isArray(rawSoc)) return [];
  return rawSoc
    .filter((row): row is Record<string, unknown> => row !== null && typeof row === 'object' && !Array.isArray(row))
    .map((r) => ({
      cpfCnpj: typeof r.cpf_cnpj === 'string' ? r.cpf_cnpj : null,
      nome: typeof r.nome === 'string' ? r.nome : null,
      entrada: typeof r.entrada === 'string' ? r.entrada : null,
      qualificacao: typeof r.qualificacao === 'string' ? r.qualificacao : null,
      participacao: typeof r.participacao === 'string' ? r.participacao : null,
      situacao: typeof r.situacao === 'string' ? r.situacao : null,
      pep: str(r.pep),
      tipoSocio: typeof r.tipo_socio === 'string' ? r.tipo_socio : null,
    }));
}

// ─── Main facade class ────────────────────────────────────────────────────────

export class UpminerRelationalPayloadMapper {
  // ─── Method name constants ────────────────────────────────────────────────

  static readonly METHOD_RECEITA = 'receitaFederalPj';
  static readonly METHOD_QSA = 'baseEmpresas';
  static readonly METHOD_CADE = 'cade';
  static readonly CERTIDAO_METHODS = [
    'MpfCertidaoNegativa',
    'TcuCertidoesInidoneos',
    'CertidaoTJDFT',
    'Tst',
    'BancoDeFalenciasTst',
    'CertidaoCadastroNacionalDeCondenacoesCiveis',
    'CrdaPge',
  ] as const;
  static readonly SANCAO_METHODS = [
    'ofacInstant',
    'listaOnu',
    'worldBank',
    'baseOffshore',
    'informacaoJuridicaDocumento',
    'TransparenciaBrasilCnep',
    'TransparenciaBrasilCeis',
    'TransparenciaBrasilCepim',
    'EmpresasPunidasSp',
  ] as const;
  static readonly METHOD_SICAF = 'sicaf';
  static readonly METHOD_MPF = 'mpfRelevancia';
  static readonly METHOD_DJEN = 'Djen';
  static readonly METHOD_PROCON = 'proconSp';
  static readonly METHOD_RECLAME_AQUI = 'reclameAqui';
  static readonly METHOD_CRSFN = 'bancoCentralCrsfnEmentasAcordaos';
  static readonly METHOD_TCU = 'tcu';
  static readonly METHOD_CONTRATOS = 'transparenciaContratos';
  static readonly METHOD_GOOGLE = 'googleGlobal';

  // ─── Core sources ─────────────────────────────────────────────────────────

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
      pep: str(o.pep),
    };
    return { qsa, socios: parseQsaSocios(o.aSocio) };
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

  // ─── Phase 1: Certidões ────────────────────────────────────────────────────

  static readonly parseCertidao = parseCertidao;

  // ─── Phase 2: Sanções ──────────────────────────────────────────────────────

  static readonly parseSancaoHits = parseSancaoHits;
  static readonly parseSicaf = parseSicaf;

  // ─── Phase 3: Administrative processes ────────────────────────────────────

  static readonly parseMpfRelevancia = parseMpfRelevancia;
  static readonly parseDjen = parseDjen;
  static readonly parseProconSp = parseProconSp;
  static readonly parseReclameAqui = parseReclameAqui;
  static readonly parseCrsfn = parseCrsfn;
  static readonly parseTcu = parseTcu;

  // ─── Phase 4: Especiais ────────────────────────────────────────────────────

  static readonly parseContratos = parseContratos;
  static readonly parseGoogleGlobal = parseGoogleGlobal;
}
