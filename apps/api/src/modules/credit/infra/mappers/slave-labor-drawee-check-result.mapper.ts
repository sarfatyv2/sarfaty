import { type slaveLaborDraweeCheckResults } from '../../../../database/schema/slave-labor-drawee-check-results';
import { SlaveLaborDraweeCheckResult } from '../../domain/slave-labor-drawee-check-result.entity';

type DrizzleRow = typeof slaveLaborDraweeCheckResults.$inferSelect;
type InsertRow = typeof slaveLaborDraweeCheckResults.$inferInsert;

export class SlaveLaborDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): SlaveLaborDraweeCheckResult {
    return SlaveLaborDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      hasMatch: raw.hasMatch,
      employerName: raw.employerName,
      rescuedWorkers: raw.rescuedWorkers,
      inspectionDate: raw.inspectionDate,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: SlaveLaborDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cnpj: entity.cnpj,
      hasMatch: entity.hasMatch,
      employerName: entity.employerName,
      rescuedWorkers: entity.rescuedWorkers,
      inspectionDate: entity.inspectionDate,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
