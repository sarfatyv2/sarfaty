import { type cndtDraweeCheckResults } from '../../../../database/schema/cndt-drawee-check-results';
import { CndtDraweeCheckResult, type CndtCertificateStatus } from '../../domain/cndt-drawee-check-result.entity';

type DrizzleRow = typeof cndtDraweeCheckResults.$inferSelect;
type InsertRow = typeof cndtDraweeCheckResults.$inferInsert;

export class CndtDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): CndtDraweeCheckResult {
    return CndtDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      certificateStatus: raw.certificateStatus as CndtCertificateStatus,
      certificateNumber: raw.certificateNumber,
      validUntil: raw.validUntil,
      rawData: raw.rawData as Record<string, unknown> | null,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: CndtDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cnpj: entity.cnpj,
      certificateStatus: entity.certificateStatus,
      certificateNumber: entity.certificateNumber,
      validUntil: entity.validUntil,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
