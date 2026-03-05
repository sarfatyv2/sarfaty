import { type negativeMediaDraweeResults } from '../../../../database/schema/negative-media-drawee-results';
import { NegativeMediaDraweeResult, type MediaRiskLevel } from '../../domain/negative-media-drawee-result.entity';

type DrizzleRow = typeof negativeMediaDraweeResults.$inferSelect;
type InsertRow = typeof negativeMediaDraweeResults.$inferInsert;

export class NegativeMediaDraweeResultMapper {
  static toDomain(raw: DrizzleRow): NegativeMediaDraweeResult {
    return NegativeMediaDraweeResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      companyName: raw.companyName,
      riskLevel: raw.riskLevel as MediaRiskLevel,
      findingsCount: raw.findingsCount,
      findings: raw.findings as Record<string, unknown>[] | null,
      summary: raw.summary,
      groundingSources: raw.groundingSources as Record<string, unknown>[] | null,
      rawResponse: raw.rawResponse as Record<string, unknown> | null,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: NegativeMediaDraweeResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cnpj: entity.cnpj,
      companyName: entity.companyName,
      riskLevel: entity.riskLevel,
      findingsCount: entity.findingsCount,
      findings: entity.findings,
      summary: entity.summary,
      groundingSources: entity.groundingSources,
      rawResponse: entity.rawResponse,
      queriedAt: entity.queriedAt,
    };
  }
}
