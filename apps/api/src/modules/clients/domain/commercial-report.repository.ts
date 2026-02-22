import { CommercialReportEntity } from './commercial-report.entity';

export const COMMERCIAL_REPORT_REPOSITORY = 'COMMERCIAL_REPORT_REPOSITORY';

export interface CommercialReportRepository {
  save(report: CommercialReportEntity): Promise<CommercialReportEntity>;
  findByClientId(clientId: string): Promise<CommercialReportEntity[]>;
  findLatestByClientId(clientId: string): Promise<CommercialReportEntity | null>;
}