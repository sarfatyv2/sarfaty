import { type PepDraweeCheckResult } from './pep-drawee-check-result.entity';

export const PEP_DRAWEE_CHECK_REPOSITORY = Symbol('PEP_DRAWEE_CHECK_REPOSITORY');

export interface PepDraweeCheckRepository {
  save(result: PepDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<PepDraweeCheckResult[]>;
}
