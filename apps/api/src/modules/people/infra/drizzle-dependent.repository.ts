import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { collaboratorDependents } from '../../../database/schema/collaborator-dependents';
import type { DependentRepository } from '../domain/dependent.repository';
import type { Dependent } from '../domain/dependent.entity';
import { DependentMapper } from './mappers/dependent.mapper';

@Injectable()
export class DrizzleDependentRepository implements DependentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByCollaboratorId(collaboratorId: string): Promise<Dependent[]> {
    const rows = await this.db
      .select()
      .from(collaboratorDependents)
      .where(eq(collaboratorDependents.collaboratorId, collaboratorId));

    return rows.map((row) => DependentMapper.toDomain(row));
  }

  async findById(id: string): Promise<Dependent | null> {
    const rows = await this.db
      .select()
      .from(collaboratorDependents)
      .where(eq(collaboratorDependents.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return DependentMapper.toDomain(row);
  }

  async create(data: {
    collaboratorId: string;
    fullName: string;
    relationship: string | null;
    dateOfBirth: string | null;
    cpf: string | null;
    isIrDependent: boolean;
    isHealthPlan: boolean;
    notes: string | null;
  }): Promise<Dependent> {
    const [row] = await this.db
      .insert(collaboratorDependents)
      .values(data)
      .returning();

    if (!row) {
      throw new Error('Failed to insert dependent');
    }

    return DependentMapper.toDomain(row);
  }

  async update(id: string, data: Record<string, unknown>): Promise<Dependent | null> {
    const rows = await this.db
      .update(collaboratorDependents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(collaboratorDependents.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;

    return DependentMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(collaboratorDependents)
      .where(eq(collaboratorDependents.id, id));
  }
}
