import { type SerasaDraweeReport } from './serasa-drawee-report.entity';

export const SERASA_DRAWEE_REPORT_REPOSITORY = Symbol('SERASA_DRAWEE_REPORT_REPOSITORY');

export interface SerasaDraweeReportRepository {
  save(report: SerasaDraweeReport): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<SerasaDraweeReport | null>;
  getByDraweeId(draweeId: string): Promise<SerasaDraweeReport[]>;
}
