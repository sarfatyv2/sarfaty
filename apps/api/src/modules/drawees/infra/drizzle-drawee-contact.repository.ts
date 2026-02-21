import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { draweeContacts } from '../../../database/schema';

export const DRAWEE_CONTACT_REPOSITORY = Symbol('DRAWEE_CONTACT_REPOSITORY');

export interface DraweeContactRepository {
  findAllByDraweeId(draweeId: string): Promise<(typeof draweeContacts.$inferSelect)[]>;
  findById(id: string): Promise<(typeof draweeContacts.$inferSelect) | null>;
  save(data: typeof draweeContacts.$inferInsert): Promise<typeof draweeContacts.$inferSelect>;
  update(id: string, data: Record<string, unknown>): Promise<(typeof draweeContacts.$inferSelect) | null>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class DrizzleDraweeContactRepository implements DraweeContactRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByDraweeId(draweeId: string) {
    return this.db.select().from(draweeContacts).where(eq(draweeContacts.draweeId, draweeId));
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(draweeContacts).where(eq(draweeContacts.id, id)).limit(1);
    return row ?? null;
  }

  async save(data: typeof draweeContacts.$inferInsert) {
    const [row] = await this.db.insert(draweeContacts).values(data).returning();
    return row!;
  }

  async update(id: string, data: Record<string, unknown>) {
    const [row] = await this.db
      .update(draweeContacts)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof draweeContacts.$inferInsert>)
      .where(eq(draweeContacts.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string) {
    await this.db.delete(draweeContacts).where(eq(draweeContacts.id, id));
  }
}
