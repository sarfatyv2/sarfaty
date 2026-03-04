import { type PgfnCheckResult } from './pgfn-check-result.entity';

export const PGFN_CHECK_REPOSITORY = 'PGFN_CHECK_REPOSITORY';

export interface PgfnCheckRepository {
  save(result: PgfnCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<PgfnCheckResult | null>;
}
