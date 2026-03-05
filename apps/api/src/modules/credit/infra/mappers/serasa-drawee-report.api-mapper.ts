import { SerasaDraweeReport } from '../../domain/serasa-drawee-report.entity';

export class SerasaDraweeReportApiMapper {
  static toResponse(entity: SerasaDraweeReport): Record<string, unknown> {
    return {
      id: entity.id,
      draweeId: entity.draweeId,
      cnpj: entity.cnpj,
      reportName: entity.reportName,
      optionalFeatures: entity.optionalFeatures,
      statusCode: entity.statusCode,
      rawResponse: entity.rawResponse,
      errorMessage: entity.errorMessage,
      requestId: entity.requestId,
      createdAt: entity.createdAt,
      isSuccess: entity.isSuccess,
    };
  }
}
