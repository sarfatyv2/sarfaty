import { type CguCheckResult } from './cgu-check-result.entity';

export const CGU_CHECK_REPOSITORY = 'CGU_CHECK_REPOSITORY';

export interface CguCheckRepository {
  save(result: CguCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<CguCheckResult[]>;
}
