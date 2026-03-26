import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type {
  CercValidationEventosRepository,
  CercValidationEventoRow,
} from '../../domain/cerc-validation-eventos.repository';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { cercValidationEventos } from '../../../../database/schema/cerc-validations';

@Injectable()
export class DrizzleCercValidationEventosRepository implements CercValidationEventosRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async saveMany(rows: CercValidationEventoRow[]): Promise<void> {
    if (rows.length === 0) return;
    await this.db
      .insert(cercValidationEventos)
      .values(rows.map((r) => ({
        cercValidationId: r.cercValidationId,
        data: r.data,
        codigo: r.codigo,
        descricao: r.descricao,
      })))
      .execute();
  }

  async findByValidationId(cercValidationId: string): Promise<CercValidationEventoRow[]> {
    const rows = await this.db
      .select()
      .from(cercValidationEventos)
      .where(eq(cercValidationEventos.cercValidationId, cercValidationId))
      .execute();

    return rows.map((r) => ({
      id: r.id,
      cercValidationId: r.cercValidationId,
      data: r.data,
      codigo: r.codigo,
      descricao: r.descricao,
      createdAt: r.createdAt ?? undefined,
    }));
  }

  async deleteByValidationId(cercValidationId: string): Promise<void> {
    await this.db
      .delete(cercValidationEventos)
      .where(eq(cercValidationEventos.cercValidationId, cercValidationId))
      .execute();
  }
}
