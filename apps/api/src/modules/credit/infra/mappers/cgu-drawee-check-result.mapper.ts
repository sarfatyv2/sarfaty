import { type cguDraweeCheckResults } from '../../../../database/schema/cgu-drawee-check-results';
import { CguDraweeCheckResult, type CguCheckType } from '../../domain/cgu-drawee-check-result.entity';

type DrizzleRow = typeof cguDraweeCheckResults.$inferSelect;
type InsertRow = typeof cguDraweeCheckResults.$inferInsert;

export class CguDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): CguDraweeCheckResult {
    return CguDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      checkType: raw.checkType as CguCheckType,
      hasMatch: raw.hasMatch,
      matchCount: raw.matchCount,
      summary: raw.summary,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: CguDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
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
