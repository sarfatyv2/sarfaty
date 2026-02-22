import { type CreditboxReport } from './creditbox-report.entity';

export const CREDITBOX_REPOSITORY = 'CREDITBOX_REPOSITORY';

export interface CreditboxRepository {
  save(report: CreditboxReport): Promise<void>;
  update(report: CreditboxReport): Promise<void>;
  
  getLatestByClientId(clientId: string): Promise<CreditboxReport | null>;
  getByProcessId(processId: string): Promise<CreditboxReport | null>;
}
