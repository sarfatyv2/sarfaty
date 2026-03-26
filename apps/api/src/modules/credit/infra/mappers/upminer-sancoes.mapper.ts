/** Phase 2 — Sanções / Impedimentos + SICAF mapper. */

import { str, isEmpty, toObj } from './upminer-mapper.utils';

export const SANCAO_METHODS = [
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

export const SICAF_METHOD = 'sicaf';

export interface SancaoHitInsertShape {
  method: string;
  nome: string | null;
  cpfCnpj: string | null;
  tipoSancao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  orgaoSancionador: string | null;
  fundamentacao: string | null;
  pais: string | null;
  observacao: string | null;
}

export interface SicafInsertShape {
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacao: string | null;
  situacaoCadastral: string | null;
}

export function parseSancaoHits(method: string, payload: unknown): SancaoHitInsertShape[] {
  if (isEmpty(payload)) return [];
  const rows = Array.isArray(payload) ? payload : [payload];
  const out: SancaoHitInsertShape[] = [];
  for (const item of rows) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    out.push({
      method,
      nome: str(o.nome) ?? str(o.name) ?? str(o.entity_name) ?? null,
      cpfCnpj: str(o.cpf_cnpj) ?? str(o.cnpj) ?? str(o.document) ?? null,
      tipoSancao: str(o.tipo_sancao) ?? str(o.tipo_penalidade) ?? str(o.tipo) ?? str(o.sanction_type) ?? null,
      dataInicio: str(o.data_inicio) ?? str(o.data_publicacao) ?? str(o.from_date) ?? null,
      dataFim: str(o.data_fim) ?? str(o.to_date) ?? null,
      orgaoSancionador: str(o.orgao_sancionador) ?? str(o.orgao) ?? str(o.source) ?? null,
      fundamentacao: str(o.fundamentacao) ?? str(o.lei) ?? str(o.grounds) ?? null,
      pais: str(o.pais) ?? str(o.country) ?? null,
      observacao: str(o.observacao) ?? str(o.motivo) ?? str(o.reason) ?? null,
    });
  }
  return out;
}

export function parseSicaf(payload: unknown): SicafInsertShape | null {
  if (isEmpty(payload)) return null;
  const o = toObj(payload);
  return {
    cnpj: str(o.cnpj),
    razaoSocial: str(o.razao_social),
    nomeFantasia: str(o.nome_fantasia),
    situacao: str(o.situacao),
    situacaoCadastral: str(o.situacao_cadastral),
  };
}
