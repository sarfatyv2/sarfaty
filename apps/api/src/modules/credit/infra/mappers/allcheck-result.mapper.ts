import { type allcheckResults } from '../../../../database/schema/allcheck-results';
import { AllcheckResult } from '../../domain/allcheck-result.entity';

type DrizzleRow = typeof allcheckResults.$inferSelect;
type InsertRow = typeof allcheckResults.$inferInsert;

export class AllcheckResultMapper {
  static toDomain(raw: DrizzleRow): AllcheckResult {
    return AllcheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
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

  static toPersistence(entity: AllcheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
