import { type addressValidationResults } from '../../../../database/schema/address-validation-results';
import { AddressValidationResult } from '../../domain/address-validation-result.entity';

type DrizzleAddressValidationResult = typeof addressValidationResults.$inferSelect;
type InsertAddressValidationResult = typeof addressValidationResults.$inferInsert;

export class AddressValidationResultMapper {
  static toDomain(raw: DrizzleAddressValidationResult): AddressValidationResult {
    return AddressValidationResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cep: raw.cep,
      isValid: raw.isValid,
      street: raw.street,
      neighborhood: raw.neighborhood,
      city: raw.city,
      state: raw.state,
      matchesRegistered: raw.matchesRegistered,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: AddressValidationResult): InsertAddressValidationResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      cep: entity.cep,
      isValid: entity.isValid,
      street: entity.street,
      neighborhood: entity.neighborhood,
      city: entity.city,
      state: entity.state,
      matchesRegistered: entity.matchesRegistered,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
