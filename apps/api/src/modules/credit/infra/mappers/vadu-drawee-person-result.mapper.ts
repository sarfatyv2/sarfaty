import { type vaduDraweePersonResults } from '../../../../database/schema/vadu-drawee-person-results';
import { VaduDraweePersonResult } from '../../domain/vadu-drawee-person-result.entity';

type DrizzleRow = typeof vaduDraweePersonResults.$inferSelect;
type InsertRow = typeof vaduDraweePersonResults.$inferInsert;

export class VaduDraweePersonResultMapper {
  static toDomain(raw: DrizzleRow): VaduDraweePersonResult {
    return VaduDraweePersonResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cpf: raw.cpf,
      name: raw.name,
      birthDate: raw.birthDate,
      motherName: raw.motherName,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: VaduDraweePersonResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cpf: entity.cpf,
      name: entity.name,
      birthDate: entity.birthDate,
      motherName: entity.motherName,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
