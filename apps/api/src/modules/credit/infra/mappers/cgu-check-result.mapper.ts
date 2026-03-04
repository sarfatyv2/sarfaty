import { type cguCheckResults } from '../../../../database/schema/cgu-check-results';
import { CguCheckResult, type CguCheckType } from '../../domain/cgu-check-result.entity';

type DrizzleCguCheckResult = typeof cguCheckResults.$inferSelect;
type InsertCguCheckResult = typeof cguCheckResults.$inferInsert;

export class CguCheckResultMapper {
  static toDomain(raw: DrizzleCguCheckResult): CguCheckResult {
    return CguCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      checkType: raw.checkType as CguCheckType,
      hasMatch: raw.hasMatch,
      matchCount: raw.matchCount,
      summary: raw.summary,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: CguCheckResult): InsertCguCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      cnpj: entity.cnpj,
      checkType: entity.checkType,
      hasMatch: entity.hasMatch,
      matchCount: entity.matchCount,
      summary: entity.summary,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
