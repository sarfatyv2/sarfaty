import { type cndtCheckResults } from '../../../../database/schema/cndt-check-results';
import { CndtCheckResult, type CndtCertificateStatus } from '../../domain/cndt-check-result.entity';

type DrizzleCndtCheckResult = typeof cndtCheckResults.$inferSelect;
type InsertCndtCheckResult = typeof cndtCheckResults.$inferInsert;

export class CndtCheckResultMapper {
  static toDomain(raw: DrizzleCndtCheckResult): CndtCheckResult {
    return CndtCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      certificateStatus: raw.certificateStatus as CndtCertificateStatus,
      certificateNumber: raw.certificateNumber,
      validUntil: raw.validUntil,
      rawData: raw.rawData as Record<string, unknown> | null,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: CndtCheckResult): InsertCndtCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      cnpj: entity.cnpj,
      certificateStatus: entity.certificateStatus,
      certificateNumber: entity.certificateNumber,
      validUntil: entity.validUntil,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
