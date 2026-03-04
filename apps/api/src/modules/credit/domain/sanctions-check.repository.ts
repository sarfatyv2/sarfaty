import { type SanctionsCheckResult } from './sanctions-check-result.entity';

export const SANCTIONS_CHECK_REPOSITORY = 'SANCTIONS_CHECK_REPOSITORY';

export interface SanctionsCheckRepository {
  save(result: SanctionsCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<SanctionsCheckResult[]>;
}
