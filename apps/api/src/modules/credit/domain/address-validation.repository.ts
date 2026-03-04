import { type AddressValidationResult } from './address-validation-result.entity';

export const ADDRESS_VALIDATION_REPOSITORY = 'ADDRESS_VALIDATION_REPOSITORY';

export interface AddressValidationRepository {
  save(result: AddressValidationResult): Promise<void>;
  getLatestByClientId(clientId: string): Promise<AddressValidationResult | null>;
}
