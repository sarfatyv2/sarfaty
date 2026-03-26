/** Phase 1 — Certidões Negativas mapper. */

import { str, isEmpty, toObj } from './upminer-mapper.utils';

export const CERTIDAO_METHODS = [
  'MpfCertidaoNegativa',
  'TcuCertidoesInidoneos',
  'CertidaoTJDFT',
  'Tst',
  'BancoDeFalenciasTst',
  'CertidaoCadastroNacionalDeCondenacoesCiveis',
  'CrdaPge',
] as const;

export interface CertidaoInsertShape {
  method: string;
  nome: string | null;
  documento: string | null;
  conteudo: string | null;
  pdf: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  certidaoNumero: string | null;
  seloDigital: string | null;
}

export function parseCertidao(method: string, payload: unknown): CertidaoInsertShape | null {
  if (isEmpty(payload)) return null;
  const o = toObj(payload);

  const conteudo = str(o.conteudo) ?? str(o.text) ?? str(o.texto) ?? null;

  const dataEmissao =
    str(o.data_emissao) ??
    str(o.emissao) ??
    str(o.expedicao) ??
    str(o.dataEmissao) ??
    null;

  const dataValidade =
    str(o.data_validade) ??
    str(o.validade) ??
    str(o.dataValidade) ??
    null;

  const certidaoNumero =
    str(o.certidao) ??
    str(o.certidao_numero) ??
    str(o.numero) ??
    null;

  const seloDigital =
    str(o.selo_digital) ??
    str(o.seloDigital) ??
    null;

  return {
    method,
    nome: str(o.nome),
    documento: str(o.documento),
    conteudo,
    pdf: str(o.pdf),
    dataEmissao,
    dataValidade,
    certidaoNumero,
    seloDigital,
  };
}
