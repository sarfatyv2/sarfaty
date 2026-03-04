import { type SlaveLaborCheckResult } from './slave-labor-check-result.entity';

export const SLAVE_LABOR_CHECK_REPOSITORY = 'SLAVE_LABOR_CHECK_REPOSITORY';

export interface SlaveLaborCheckRepository {
  save(result: SlaveLaborCheckResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<SlaveLaborCheckResult | null>;
}
