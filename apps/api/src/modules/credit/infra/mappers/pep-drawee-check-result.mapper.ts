import { type pepDraweeCheckResults } from '../../../../database/schema/pep-drawee-check-results';
import { PepDraweeCheckResult } from '../../domain/pep-drawee-check-result.entity';

type DrizzleRow = typeof pepDraweeCheckResults.$inferSelect;
type InsertRow = typeof pepDraweeCheckResults.$inferInsert;

export class PepDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): PepDraweeCheckResult {
    return PepDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cpf: raw.cpf,
      personName: raw.personName,
      hasMatch: raw.hasMatch,
      matchedRole: raw.matchedRole,
      matchedOrg: raw.matchedOrg,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: PepDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cpf: entity.cpf,
      personName: entity.personName,
      hasMatch: entity.hasMatch,
      matchedRole: entity.matchedRole,
      matchedOrg: entity.matchedOrg,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
