import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { CercValidationResultadoRepository } from '../../domain/cerc-validation-resultado.repository';
import type { CercValidationResultado } from '../../domain/cerc-validation-resultado.entity';
import { CercValidationResultadoMapper } from '../mappers/cerc-validation-resultado.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { cercValidationResultados } from '../../../../database/schema/cerc-validations';

@Injectable()
export class DrizzleCercValidationResultadoRepository implements CercValidationResultadoRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async saveMany(entities: CercValidationResultado[]): Promise<void> {
    if (entities.length === 0) return;

    const rows = entities.map(CercValidationResultadoMapper.toPersistence);
    await this.db.insert(cercValidationResultados).values(rows).execute();
  }

  async getByValidationId(cercValidationId: string): Promise<CercValidationResultado[]> {
    const rows = await this.db
      .select()
      .from(cercValidationResultados)
      .where(eq(cercValidationResultados.cercValidationId, cercValidationId))
      .execute();

    return rows.map(CercValidationResultadoMapper.toDomain);
  }

  async deleteByValidationId(cercValidationId: string): Promise<void> {
    await this.db
      .delete(cercValidationResultados)
      .where(eq(cercValidationResultados.cercValidationId, cercValidationId))
      .execute();
  }
}
