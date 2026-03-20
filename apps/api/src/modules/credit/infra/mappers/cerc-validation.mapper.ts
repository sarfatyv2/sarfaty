import { CercValidation, type CercValidationStatus } from '../../domain/cerc-validation.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRow = Record<string, any>;

export class CercValidationMapper {
  static toDomain(raw: RawRow): CercValidation {
    return CercValidation.reconstruct({
      id: raw.id,
      loteId: raw.loteId ?? null,
      validacaoId: raw.validacaoId ?? null,
      veiculoId: raw.veiculoId,
      numeroDuplicata: raw.numeroDuplicata,
      chaveNfe: raw.chaveNfe,
      valor: Number(raw.valor),
      vencimento: raw.vencimento,
      cnpjCedente: raw.cnpjCedente,
      cnpjCpfPagador: raw.cnpjCpfPagador,
      tipoPagador: raw.tipoPagador as 'cpf' | 'cnpj',
      cnpjOriginador: raw.cnpjOriginador,
      referenciaExterna: raw.referenciaExterna ?? null,
      planodeCobranca: raw.planodeCobranca ?? 6,
      status: raw.status as CercValidationStatus,
      statusProcessamento: raw.statusProcessamento ?? null,
      requestPayload: raw.requestPayload ?? null,
      validacaoData: raw.validacaoData ?? null,
      constatacoesDados: raw.constatacoesDados ?? null,
      eventosDados: raw.eventosDados ?? null,
      partesDados: raw.partesDados ?? null,
      docFiscalDados: raw.docFiscalDados ?? null,
      errorMessage: raw.errorMessage ?? null,
      requestedAt: new Date(raw.requestedAt),
      processedAt: raw.processedAt ? new Date(raw.processedAt) : null,
      requestedBy: raw.requestedBy ?? null,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toPersistence(entity: CercValidation): any {
    return {
      id: entity.id,
      loteId: entity.loteId,
      validacaoId: entity.validacaoId,
      veiculoId: entity.veiculoId,
      numeroDuplicata: entity.numeroDuplicata,
      chaveNfe: entity.chaveNfe,
      valor: String(entity.valor),
      vencimento: entity.vencimento,
      cnpjCedente: entity.cnpjCedente,
      cnpjCpfPagador: entity.cnpjCpfPagador,
      tipoPagador: entity.tipoPagador,
      cnpjOriginador: entity.cnpjOriginador,
      referenciaExterna: entity.referenciaExterna,
      planodeCobranca: entity.planodeCobranca,
      status: entity.status,
      statusProcessamento: entity.statusProcessamento,
      requestPayload: entity.requestPayload,
      validacaoData: entity.validacaoData,
      constatacoesDados: entity.constatacoesDados,
      eventosDados: entity.eventosDados,
      partesDados: entity.partesDados,
      docFiscalDados: entity.docFiscalDados,
      errorMessage: entity.errorMessage,
      requestedAt: entity.requestedAt,
      processedAt: entity.processedAt,
      requestedBy: entity.requestedBy,
    };
  }

  static toResponse(entity: CercValidation): Record<string, unknown> {
    return {
      id: entity.id,
      loteId: entity.loteId,
      validacaoId: entity.validacaoId,
      veiculoId: entity.veiculoId,
      numeroDuplicata: entity.numeroDuplicata,
      chaveNfe: entity.chaveNfe,
      valor: entity.valor,
      vencimento: entity.vencimento,
      cnpjCedente: entity.cnpjCedente,
      cnpjCpfPagador: entity.cnpjCpfPagador,
      tipoPagador: entity.tipoPagador,
      cnpjOriginador: entity.cnpjOriginador,
      referenciaExterna: entity.referenciaExterna,
      planodeCobranca: entity.planodeCobranca,
      status: entity.status,
      statusProcessamento: entity.statusProcessamento,
      requestPayload: entity.requestPayload,
      validacaoData: entity.validacaoData,
      constatacoesDados: entity.constatacoesDados,
      eventosDados: entity.eventosDados,
      partesDados: entity.partesDados,
      docFiscalDados: entity.docFiscalDados,
      errorMessage: entity.errorMessage,
      requestedAt: entity.requestedAt,
      processedAt: entity.processedAt,
    };
  }
}
