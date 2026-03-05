import { type SanctionsDraweeCheckResult } from './sanctions-drawee-check-result.entity';

export const SANCTIONS_DRAWEE_CHECK_REPOSITORY = Symbol('SANCTIONS_DRAWEE_CHECK_REPOSITORY');

export interface SanctionsDraweeCheckRepository {
  save(result: SanctionsDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<SanctionsDraweeCheckResult[]>;
}
