import { type AddressValidationDraweeResult } from './address-validation-drawee-result.entity';

export const ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY = Symbol('ADDRESS_VALIDATION_DRAWEE_RESULT_REPOSITORY');

export interface AddressValidationDraweeResultRepository {
  save(result: AddressValidationDraweeResult): Promise<void>;
  getLatestByDraweeId(draweeId: string): Promise<AddressValidationDraweeResult[]>;
}
