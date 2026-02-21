import { vaduCompanyResults } from '../../../../database/schema/vadu-company-results';
import { VaduCompanyResult } from '../../domain/vadu-company-result.entity';

type DrizzleVaduCompanyResult = typeof vaduCompanyResults.$inferSelect;
type InsertVaduCompanyResult = typeof vaduCompanyResults.$inferInsert;

export class VaduCompanyResultMapper {
  static toDomain(raw: DrizzleVaduCompanyResult): VaduCompanyResult {
    return VaduCompanyResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      companyName: raw.companyName,
      tradeName: raw.tradeName,
      revenueStatus: raw.revenueStatus,
      revenueStatusDate: raw.revenueStatusDate,
      specialStatus: raw.specialStatus,
      capitalSocial: raw.capitalSocial ? Number(raw.capitalSocial) : null,
      legalNature: raw.legalNature,
      isSimplesNacional: raw.isSimplesNacional,
      companySize: raw.companySize,
      environmentalScore: raw.environmentalScore ? Number(raw.environmentalScore) : null,
      environmentalLevel: raw.environmentalLevel,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: VaduCompanyResult): InsertVaduCompanyResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      cnpj: entity.cnpj,
      companyName: entity.companyName,
      tradeName: entity.tradeName,
      revenueStatus: entity.revenueStatus,
      revenueStatusDate: entity.revenueStatusDate,
      specialStatus: entity.specialStatus,
      capitalSocial: entity.capitalSocial ? String(entity.capitalSocial) : null,
      legalNature: entity.legalNature,
      isSimplesNacional: entity.isSimplesNacional,
      companySize: entity.companySize,
      environmentalScore: entity.environmentalScore ? String(entity.environmentalScore) : null,
      environmentalLevel: entity.environmentalLevel,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
