import { type negativeMediaResults } from '../../../../database/schema/negative-media-results';
import { NegativeMediaResult, type MediaRiskLevel } from '../../domain/negative-media-result.entity';

type DrizzleNegativeMediaResult = typeof negativeMediaResults.$inferSelect;
type InsertNegativeMediaResult = typeof negativeMediaResults.$inferInsert;

export class NegativeMediaResultMapper {
  static toDomain(raw: DrizzleNegativeMediaResult): NegativeMediaResult {
    return NegativeMediaResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
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

  static toPersistence(entity: NegativeMediaResult): InsertNegativeMediaResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
