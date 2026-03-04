import { type sanctionsCheckResults } from '../../../../database/schema/sanctions-check-results';
import { SanctionsCheckResult, type SanctionsSource } from '../../domain/sanctions-check-result.entity';

type DrizzleSanctionsCheckResult = typeof sanctionsCheckResults.$inferSelect;
type InsertSanctionsCheckResult = typeof sanctionsCheckResults.$inferInsert;

export class SanctionsCheckResultMapper {
  static toDomain(raw: DrizzleSanctionsCheckResult): SanctionsCheckResult {
    return SanctionsCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
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

  static toPersistence(entity: SanctionsCheckResult): InsertSanctionsCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
