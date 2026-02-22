import { type VaduCompanyResult } from './vadu-company-result.entity';
import { type VaduPersonResult } from './vadu-person-result.entity';

export const VADU_REPOSITORY = 'VADU_REPOSITORY';

export interface VaduRepository {
  saveCompanyResult(result: VaduCompanyResult): Promise<void>;
  savePersonResult(result: VaduPersonResult): Promise<void>;
  
  getLatestCompanyResult(clientId: string): Promise<VaduCompanyResult | null>;
  getLatestPersonResults(clientId: string): Promise<VaduPersonResult[]>;
}
