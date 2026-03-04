import { type slaveLaborCheckResults } from '../../../../database/schema/slave-labor-check-results';
import { SlaveLaborCheckResult } from '../../domain/slave-labor-check-result.entity';

type DrizzleSlaveLaborCheckResult = typeof slaveLaborCheckResults.$inferSelect;
type InsertSlaveLaborCheckResult = typeof slaveLaborCheckResults.$inferInsert;

export class SlaveLaborCheckResultMapper {
  static toDomain(raw: DrizzleSlaveLaborCheckResult): SlaveLaborCheckResult {
    return SlaveLaborCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      hasMatch: raw.hasMatch,
      employerName: raw.employerName,
      rescuedWorkers: raw.rescuedWorkers,
      inspectionDate: raw.inspectionDate,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: SlaveLaborCheckResult): InsertSlaveLaborCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
