import { type PepCheckResult } from './pep-check-result.entity';

export const PEP_CHECK_REPOSITORY = 'PEP_CHECK_REPOSITORY';

export interface PepCheckRepository {
  save(result: PepCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<PepCheckResult[]>;
}
