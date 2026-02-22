import { type vaduPersonResults } from '../../../../database/schema/vadu-person-results';
import { VaduPersonResult } from '../../domain/vadu-person-result.entity';

type DrizzleVaduPersonResult = typeof vaduPersonResults.$inferSelect;
type InsertVaduPersonResult = typeof vaduPersonResults.$inferInsert;

export class VaduPersonResultMapper {
  static toDomain(raw: DrizzleVaduPersonResult): VaduPersonResult {
    return VaduPersonResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      authorizedPersonId: raw.authorizedPersonId,
      cpf: raw.cpf,
      name: raw.name,
      birthDate: raw.birthDate,
      motherName: raw.motherName,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: VaduPersonResult): InsertVaduPersonResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      authorizedPersonId: entity.authorizedPersonId,
      cpf: entity.cpf,
      name: entity.name,
      birthDate: entity.birthDate,
      motherName: entity.motherName,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
