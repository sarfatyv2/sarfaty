import { type CndtDraweeCheckResult } from './cndt-drawee-check-result.entity';

export const CNDT_DRAWEE_CHECK_REPOSITORY = Symbol('CNDT_DRAWEE_CHECK_REPOSITORY');

export interface CndtDraweeCheckRepository {
  save(result: CndtDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<CndtDraweeCheckResult[]>;
}
