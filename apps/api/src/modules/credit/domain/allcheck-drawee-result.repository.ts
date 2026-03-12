import { type AllcheckDraweeResult } from './allcheck-drawee-result.entity';

export const ALLCHECK_DRAWEE_RESULT_REPOSITORY = 'ALLCHECK_DRAWEE_RESULT_REPOSITORY';

export interface AllcheckDraweeResultRepository {
  save(result: AllcheckDraweeResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<AllcheckDraweeResult | null>;
}
