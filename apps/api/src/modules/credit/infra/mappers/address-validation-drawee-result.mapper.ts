import { type addressValidationDraweeResults } from '../../../../database/schema/address-validation-drawee-results';
import { AddressValidationDraweeResult } from '../../domain/address-validation-drawee-result.entity';

type DrizzleRow = typeof addressValidationDraweeResults.$inferSelect;
type InsertRow = typeof addressValidationDraweeResults.$inferInsert;

export class AddressValidationDraweeResultMapper {
  static toDomain(raw: DrizzleRow): AddressValidationDraweeResult {
    return AddressValidationDraweeResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
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

  static toPersistence(entity: AddressValidationDraweeResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
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
