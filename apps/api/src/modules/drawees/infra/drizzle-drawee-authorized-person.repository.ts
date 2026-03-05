import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { draweeAuthorizedPersons } from '../../../database/schema';
import type { DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';
import { DraweeAuthorizedPerson } from '../domain/drawee-authorized-person.entity';
import { DraweeAuthorizedPersonMapper } from './mappers/drawee-authorized-person.mapper';

@Injectable()
export class DrizzleDraweeAuthorizedPersonRepository implements DraweeAuthorizedPersonRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByDraweeId(draweeId: string): Promise<DraweeAuthorizedPerson[]> {
    const rows = await this.db
      .select()
      .from(draweeAuthorizedPersons)
      .where(eq(draweeAuthorizedPersons.draweeId, draweeId));
    return rows.map(DraweeAuthorizedPersonMapper.toDomain);
  }

  async findById(id: string): Promise<DraweeAuthorizedPerson | null> {
    const [row] = await this.db
      .select()
      .from(draweeAuthorizedPersons)
      .where(eq(draweeAuthorizedPersons.id, id))
      .limit(1);
    return row ? DraweeAuthorizedPersonMapper.toDomain(row) : null;
  }

  async findByDraweeAndSource(draweeId: string, source: string): Promise<DraweeAuthorizedPerson[]> {
    const rows = await this.db
      .select()
      .from(draweeAuthorizedPersons)
      .where(
        and(
          eq(draweeAuthorizedPersons.draweeId, draweeId),
          eq(draweeAuthorizedPersons.source, source),
        ),
      );
    return rows.map(DraweeAuthorizedPersonMapper.toDomain);
  }

  async save(person: DraweeAuthorizedPerson): Promise<DraweeAuthorizedPerson> {
    const data = DraweeAuthorizedPersonMapper.toPersistence(person);
    const [row] = await this.db
      .insert(draweeAuthorizedPersons)
      .values(data as typeof draweeAuthorizedPersons.$inferInsert)
      .returning();
    return DraweeAuthorizedPersonMapper.toDomain(row!);
  }

  async update(id: string, data: Record<string, unknown>): Promise<DraweeAuthorizedPerson | null> {
    const [row] = await this.db
      .update(draweeAuthorizedPersons)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof draweeAuthorizedPersons.$inferInsert>)
      .where(eq(draweeAuthorizedPersons.id, id))
      .returning();
    return row ? DraweeAuthorizedPersonMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(draweeAuthorizedPersons).where(eq(draweeAuthorizedPersons.id, id));
  }
}
