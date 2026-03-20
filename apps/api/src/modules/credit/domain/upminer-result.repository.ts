import { type UpminerResult } from './upminer-result.entity';

export const UPMINER_RESULT_REPOSITORY = 'UPMINER_RESULT_REPOSITORY';

export interface UpminerResultRepository {
  save(result: UpminerResult): Promise<void>;
  update(result: UpminerResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<UpminerResult | null>;
  getByBatchId(batchId: number): Promise<UpminerResult | null>;
  getByClientId(clientId: string): Promise<UpminerResult[]>;
  getPending(): Promise<UpminerResult[]>;
}
