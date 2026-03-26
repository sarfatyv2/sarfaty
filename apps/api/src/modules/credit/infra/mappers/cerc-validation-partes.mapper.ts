import type { CercValidationParteRow } from '../../domain/cerc-validation-partes.repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawObj = Record<string, any>;

function extractParte(cercValidationId: string, role: string, raw: RawObj): CercValidationParteRow | null {
  const doc = raw.documento as RawObj | undefined;
  const documentoTipo = String(doc?.tipo ?? '');
  const documentoNumero = String((doc?.identificador as RawObj)?.numero ?? '');
  if (!doc || !documentoTipo || !documentoNumero) return null;

  const endereco = raw.endereco as RawObj | undefined;
  const sitCadastral = raw.situacao_cadastral as RawObj | undefined;
  const atividadeEconomica = raw.atividade_economica as RawObj | undefined;
  const atividadePrincipal = atividadeEconomica?.principal as RawObj | undefined;

  return {
    cercValidationId,
    role,
    documentoTipo,
    documentoNumero,
    razaoSocial: String(raw.razao_social ?? raw.nome ?? '') || null,
    nomeFantasia: String(raw.nome_fantasia ?? '') || null,
    uf: String(endereco?.uf ?? '') || null,
    cep: String(endereco?.cep ?? '') || null,
    municipio: String((endereco?.municipio as RawObj)?.descricao ?? endereco?.municipio ?? '') || null,
    dataDeAbertura: String(raw.data_de_abertura ?? '') || null,
    capitalSocial: raw.capital_social == null ? null : String(raw.capital_social),
    situacaoCadastralStatus: String(sitCadastral?.status ?? '') || null,
    atividadePrincipalCodigo: String(atividadePrincipal?.codigo ?? '') || null,
    atividadePrincipalDescricao: String(atividadePrincipal?.descricao ?? '') || null,
  };
}

export class CercValidationPartesMapper {
  static fromCercResponse(
    cercValidationId: string,
    partesDados: unknown,
    validacaoDados: unknown,
  ): CercValidationParteRow[] {
    const rows = CercValidationPartesMapper.extractFromPartesDados(cercValidationId, partesDados);
    CercValidationPartesMapper.appendCedenteIfMissing(cercValidationId, validacaoDados, rows);
    return rows;
  }

  private static extractFromPartesDados(
    cercValidationId: string,
    partesDados: unknown,
  ): CercValidationParteRow[] {
    const rows: CercValidationParteRow[] = [];
    const partes = (partesDados as RawObj)?.partes as RawObj | undefined;
    if (!partes) return rows;

    for (const role of ['pagador', 'originador', 'cedente'] as const) {
      const raw = partes[role] as RawObj | undefined;
      if (raw) {
        const row = extractParte(cercValidationId, role, raw);
        if (row) rows.push(row);
      }
    }
    return rows;
  }

  private static appendCedenteIfMissing(
    cercValidationId: string,
    validacaoDados: unknown,
    rows: CercValidationParteRow[],
  ): void {
    if (rows.some((r) => r.role === 'cedente')) return;
    const cedente = (validacaoDados as RawObj)?.cedente as RawObj | undefined;
    if (cedente) {
      const row = extractParte(cercValidationId, 'cedente', cedente);
      if (row) rows.push(row);
    }
  }
}
