import { type allcheckDraweeResults } from '../../../../database/schema/allcheck-drawee-results';
import { AllcheckDraweeResult } from '../../domain/allcheck-drawee-result.entity';

type DrizzleRow = typeof allcheckDraweeResults.$inferSelect;
type InsertRow = typeof allcheckDraweeResults.$inferInsert;

export class AllcheckDraweeResultMapper {
  static toDomain(raw: DrizzleRow): AllcheckDraweeResult {
    return AllcheckDraweeResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      document: raw.document,
      name: raw.name,
      emails: raw.emails,
      currentAddress: raw.currentAddress,
      addressHistory: raw.addressHistory,
      phones: raw.phones,
      partners: raw.partners,
      companyData: raw.companyData,
      isPep: raw.isPep,
      vehicles: raw.vehicles,
      ccfOccurrences: raw.ccfOccurrences,
      consultationNetwork: raw.consultationNetwork,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: AllcheckDraweeResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      document: entity.document,
      name: entity.name,
      emails: entity.emails,
      currentAddress: entity.currentAddress,
      addressHistory: entity.addressHistory,
      phones: entity.phones,
      partners: entity.partners,
      companyData: entity.companyData,
      isPep: entity.isPep,
      vehicles: entity.vehicles,
      ccfOccurrences: entity.ccfOccurrences,
      consultationNetwork: entity.consultationNetwork,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
