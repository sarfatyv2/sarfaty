import { CreditboxReport, type CreditboxReportStatus } from '../../domain/creditbox-report.entity';

export class CreditboxReportMapper {
  static toDomain(raw: any): CreditboxReport {
    return CreditboxReport.reconstruct({
      id: raw.id,
      clientId: raw.clientId,
      processId: raw.processId,
      status: raw.status as CreditboxReportStatus,
      reportJson: raw.reportJson,
      pdfBase64: raw.pdfBase64,
      errorMessage: raw.errorMessage,
      requestedAt: new Date(raw.requestedAt),
      completedAt: raw.completedAt ? new Date(raw.completedAt) : null,
    });
  }

  static toPersistence(entity: CreditboxReport): any {
    return {
      id: entity.id,
      clientId: entity.clientId,
      processId: entity.processId,
      status: entity.status,
      reportJson: entity.reportJson,
      pdfBase64: entity.pdfBase64,
      errorMessage: entity.errorMessage,
      requestedAt: entity.requestedAt,
      completedAt: entity.completedAt,
    };
  }
}
