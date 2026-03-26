import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and, or, isNull } from 'drizzle-orm';
import type { CercValidationRepository } from '../../domain/cerc-validation.repository';
import type { CercValidation } from '../../domain/cerc-validation.entity';
import { CercValidationMapper } from '../mappers/cerc-validation.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { cercValidations } from '../../../../database/schema/cerc-validations';

@Injectable()
export class DrizzleCercValidationRepository implements CercValidationRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(entity: CercValidation): Promise<void> {
    const data = CercValidationMapper.toPersistence(entity);
    await this.db.insert(cercValidations).values(data).execute();
  }

  async update(entity: CercValidation): Promise<void> {
    const data = CercValidationMapper.toPersistence(entity);
    await this.db
      .update(cercValidations)
      .set({
        loteId: data.loteId,
        validacaoId: data.validacaoId,
        status: data.status,
        statusProcessamento: data.statusProcessamento,
        errorMessage: data.errorMessage,
        processedAt: data.processedAt,
      })
      .where(eq(cercValidations.id, entity.id))
      .execute();
  }

  async getById(id: string): Promise<CercValidation | null> {
    const rows = await this.db
      .select()
      .from(cercValidations)
      .where(eq(cercValidations.id, id))
      .limit(1)
      .execute();

    const row = rows[0];
    return row ? CercValidationMapper.toDomain(row) : null;
  }

  async getByLoteId(loteId: string): Promise<CercValidation | null> {
    const rows = await this.db
      .select()
      .from(cercValidations)
      .where(eq(cercValidations.loteId, loteId))
      .limit(1)
      .execute();

    const row = rows[0];
    return row ? CercValidationMapper.toDomain(row) : null;
  }

  async getAll(): Promise<CercValidation[]> {
    const rows = await this.db
      .select()
      .from(cercValidations)
      .orderBy(desc(cercValidations.requestedAt))
      .execute();

    return rows.map(CercValidationMapper.toDomain);
  }

  async getPending(): Promise<CercValidation[]> {
    const rows = await this.db
      .select()
      .from(cercValidations)
      .where(
        and(
          or(
            eq(cercValidations.status, 'PENDING'),
            eq(cercValidations.status, 'POLLING'),
          ),
          isNull(cercValidations.errorMessage),
        ),
      )
      .orderBy(desc(cercValidations.requestedAt))
      .execute();

    return rows.map(CercValidationMapper.toDomain).filter((e) => !e.isTerminal());
  }
}
