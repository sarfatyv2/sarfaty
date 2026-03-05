import { type SlaveLaborDraweeCheckResult } from './slave-labor-drawee-check-result.entity';

export const SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY = Symbol('SLAVE_LABOR_DRAWEE_CHECK_REPOSITORY');

export interface SlaveLaborDraweeCheckRepository {
  save(result: SlaveLaborDraweeCheckResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<SlaveLaborDraweeCheckResult[]>;
}
