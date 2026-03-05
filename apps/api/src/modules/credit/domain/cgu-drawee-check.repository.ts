import { type CguDraweeCheckResult } from './cgu-drawee-check-result.entity';

export const CGU_DRAWEE_CHECK_REPOSITORY = Symbol('CGU_DRAWEE_CHECK_REPOSITORY');

export interface CguDraweeCheckRepository {
  save(result: CguDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<CguDraweeCheckResult[]>;
}
