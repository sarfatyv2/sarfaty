/** Phase 4 — Fontes Especiais mapper (Contratos Públicos + Google). */

import { str, isEmpty, toObj } from './upminer-mapper.utils';

export const CONTRATOS_METHOD = 'transparenciaContratos';
export const GOOGLE_METHOD = 'googleGlobal';

export interface ContratoInsertShape {
  apiId: string | null;
  ano: string | null;
  mes: string | null;
  numeroContrato: string | null;
  objeto: string | null;
  fundamentoLegal: string | null;
  modalidadeCompra: string | null;
  situacaoCompra: string | null;
  nomeOrgaoSuperior: string | null;
  nomeOrgao: string | null;
  nomeUg: string | null;
  assinaturaContrato: string | null;
  publicacaoDou: string | null;
  inicioVigencia: string | null;
  fimVigencia: string | null;
  cnpj: string | null;
  nomeEmpresa: string | null;
  valorInicial: string | null;
  valorFinal: string | null;
}

export interface GoogleHitInsertShape {
  pais: string | null;
  criterio: string | null;
  url: string | null;
  titulo: string | null;
  snippet: string | null;
}

export function parseContratos(payload: unknown): ContratoInsertShape[] {
  if (!Array.isArray(payload)) return [];
  const out: ContratoInsertShape[] = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    out.push({
      apiId: str(o.id),
      ano: str(o.ano),
      mes: str(o.mes),
      numeroContrato: str(o.numero_contrato),
      objeto: str(o.objeto),
      fundamentoLegal: str(o.fundamento_legal),
      modalidadeCompra: str(o.modalidade_compra),
      situacaoCompra: str(o.situacao_compra),
      nomeOrgaoSuperior: str(o.nome_orgao_superior),
      nomeOrgao: str(o.nome_orgao),
      nomeUg: str(o.nome_ug),
      assinaturaContrato: str(o.assinatura_contrato),
      publicacaoDou: str(o.publicacao_dou),
      inicioVigencia: str(o.inicio_vigencia),
      fimVigencia: str(o.fim_vigencia),
      cnpj: str(o.cnpj),
      nomeEmpresa: str(o.nome),
      valorInicial: str(o.valor_inicial),
      valorFinal: str(o.valor_final),
    });
  }
  return out;
}

export function parseGoogleGlobal(payload: unknown): GoogleHitInsertShape[] {
  if (isEmpty(payload)) return [];
  const o = toObj(payload);
  const out: GoogleHitInsertShape[] = [];
  for (const countryBlock of Object.values(o)) {
    const block = toObj(countryBlock);
    const pais = str(block.country);
    const criterio = str(block.criterio);
    const dataArr = Array.isArray(block.data) ? block.data : [];
    for (const hit of dataArr) {
      if (!hit || typeof hit !== 'object') continue;
      const h = hit as Record<string, unknown>;
      out.push({ pais, criterio, url: str(h.url), titulo: str(h.titulo), snippet: str(h.snippet) });
    }
  }
  return out;
}
