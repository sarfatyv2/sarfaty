import { type sanctionsDraweeCheckResults } from '../../../../database/schema/sanctions-drawee-check-results';
import { SanctionsDraweeCheckResult, type SanctionsSource } from '../../domain/sanctions-drawee-check-result.entity';

type DrizzleRow = typeof sanctionsDraweeCheckResults.$inferSelect;
type InsertRow = typeof sanctionsDraweeCheckResults.$inferInsert;

export class SanctionsDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): SanctionsDraweeCheckResult {
    return SanctionsDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      entityName: raw.entityName,
      documentSearched: raw.documentSearched,
      source: raw.source as SanctionsSource,
      hasMatch: raw.hasMatch,
      matchScore: raw.matchScore ? Number(raw.matchScore) : null,
      matchDetails: raw.matchDetails,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: SanctionsDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      entityName: entity.entityName,
      documentSearched: entity.documentSearched,
      source: entity.source,
      hasMatch: entity.hasMatch,
      matchScore: entity.matchScore ? String(entity.matchScore) : null,
      matchDetails: entity.matchDetails,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
