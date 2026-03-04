import { type pepCheckResults } from '../../../../database/schema/pep-check-results';
import { PepCheckResult } from '../../domain/pep-check-result.entity';

type DrizzlePepCheckResult = typeof pepCheckResults.$inferSelect;
type InsertPepCheckResult = typeof pepCheckResults.$inferInsert;

export class PepCheckResultMapper {
  static toDomain(raw: DrizzlePepCheckResult): PepCheckResult {
    return PepCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cpf: raw.cpf,
      personName: raw.personName,
      hasMatch: raw.hasMatch,
      matchedRole: raw.matchedRole,
      matchedOrg: raw.matchedOrg,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: PepCheckResult): InsertPepCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
