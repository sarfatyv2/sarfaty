import { type SerasaReport } from './serasa-report.entity';

export const SERASA_REPORT_REPOSITORY = 'SERASA_REPORT_REPOSITORY';

export interface SerasaReportRepository {
  save(report: SerasaReport): Promise<void>;
  getLatestByClientId(clientId: string): Promise<SerasaReport | null>;
  getByClientId(clientId: string): Promise<SerasaReport[]>;
}
