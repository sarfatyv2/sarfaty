import { type vaduDraweeCompanyResults } from '../../../../database/schema/vadu-drawee-company-results';
import { VaduDraweeCompanyResult } from '../../domain/vadu-drawee-company-result.entity';

type DrizzleRow = typeof vaduDraweeCompanyResults.$inferSelect;
type InsertRow = typeof vaduDraweeCompanyResults.$inferInsert;

export class VaduDraweeCompanyResultMapper {
  static toDomain(raw: DrizzleRow): VaduDraweeCompanyResult {
    return VaduDraweeCompanyResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
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

  static toPersistence(entity: VaduDraweeCompanyResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
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
