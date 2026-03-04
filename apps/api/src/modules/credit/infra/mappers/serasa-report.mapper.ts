import { SerasaReport } from '../../domain/serasa-report.entity';

export class SerasaReportMapper {
  static toDomain(raw: any): SerasaReport {
    return SerasaReport.reconstruct({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      reportName: raw.reportName,
      optionalFeatures: raw.optionalFeatures ?? null,
      statusCode: raw.statusCode,
      rawResponse: raw.rawResponse ?? null,
      errorMessage: raw.errorMessage ?? null,
      requestId: raw.requestId ?? null,
      createdAt: new Date(raw.createdAt),
    });
  }

  static toPersistence(entity: SerasaReport): any {
    return {
      id: entity.id,
      clientId: entity.clientId,
      cnpj: entity.cnpj,
      reportName: entity.reportName,
      optionalFeatures: entity.optionalFeatures,
      statusCode: entity.statusCode,
      rawResponse: entity.rawResponse,
      errorMessage: entity.errorMessage,
      requestId: entity.requestId,
      createdAt: entity.createdAt,
    };
  }
}
