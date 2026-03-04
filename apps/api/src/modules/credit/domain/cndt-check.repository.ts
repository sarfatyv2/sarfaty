import { type CndtCheckResult } from './cndt-check-result.entity';

export const CNDT_CHECK_REPOSITORY = 'CNDT_CHECK_REPOSITORY';

export interface CndtCheckRepository {
  save(result: CndtCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<CndtCheckResult | null>;
}
