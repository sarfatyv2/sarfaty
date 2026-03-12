import { type AllcheckResult } from './allcheck-result.entity';

export const ALLCHECK_RESULT_REPOSITORY = 'ALLCHECK_RESULT_REPOSITORY';

export interface AllcheckResultRepository {
  save(result: AllcheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<AllcheckResult | null>;
}
