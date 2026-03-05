import { type VaduDraweeCompanyResult } from './vadu-drawee-company-result.entity';
import { type VaduDraweePersonResult } from './vadu-drawee-person-result.entity';

export const VADU_DRAWEE_REPOSITORY = Symbol('VADU_DRAWEE_REPOSITORY');

export interface VaduDraweeRepository {
  saveCompanyResult(result: VaduDraweeCompanyResult): Promise<void>;
  savePersonResult(result: VaduDraweePersonResult): Promise<void>;
  getLatestCompanyResult(draweeId: string): Promise<VaduDraweeCompanyResult | null>;
  getLatestPersonResults(draweeId: string): Promise<VaduDraweePersonResult[]>;
}
