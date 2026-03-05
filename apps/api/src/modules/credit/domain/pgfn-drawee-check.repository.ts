import { type PgfnDraweeCheckResult } from './pgfn-drawee-check-result.entity';

export const PGFN_DRAWEE_CHECK_REPOSITORY = Symbol('PGFN_DRAWEE_CHECK_REPOSITORY');

export interface PgfnDraweeCheckRepository {
  save(result: PgfnDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<PgfnDraweeCheckResult[]>;
}
