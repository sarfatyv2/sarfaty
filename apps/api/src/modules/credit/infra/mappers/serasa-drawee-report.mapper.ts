import { SerasaDraweeReport } from '../../domain/serasa-drawee-report.entity';
import { serasaDraweeReportResults } from '../../../../database/schema/serasa-drawee-report-results';

type DrizzleRow = typeof serasaDraweeReportResults.$inferSelect;
type DrizzleInsert = typeof serasaDraweeReportResults.$inferInsert;

export class SerasaDraweeReportMapper {
  static toDomain(raw: DrizzleRow): SerasaDraweeReport {
    return SerasaDraweeReport.reconstruct({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      reportName: raw.reportName,
      optionalFeatures: raw.optionalFeatures ?? null,
      statusCode: raw.statusCode,
      rawResponse: raw.rawResponse ?? null,
      errorMessage: raw.errorMessage ?? null,
      requestId: raw.requestId ?? null,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(entity: SerasaDraweeReport): DrizzleInsert {
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
    };
  }
}
