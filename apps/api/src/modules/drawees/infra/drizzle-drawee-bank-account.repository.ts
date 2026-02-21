import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { draweeBankAccounts } from '../../../database/schema';

export const DRAWEE_BANK_ACCOUNT_REPOSITORY = Symbol('DRAWEE_BANK_ACCOUNT_REPOSITORY');

export interface DraweeBankAccountRepository {
  findAllByDraweeId(draweeId: string): Promise<(typeof draweeBankAccounts.$inferSelect)[]>;
  findById(id: string): Promise<(typeof draweeBankAccounts.$inferSelect) | null>;
  save(data: typeof draweeBankAccounts.$inferInsert): Promise<typeof draweeBankAccounts.$inferSelect>;
  update(id: string, data: Record<string, unknown>): Promise<(typeof draweeBankAccounts.$inferSelect) | null>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class DrizzleDraweeBankAccountRepository implements DraweeBankAccountRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByDraweeId(draweeId: string) {
    return this.db.select().from(draweeBankAccounts).where(eq(draweeBankAccounts.draweeId, draweeId));
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(draweeBankAccounts).where(eq(draweeBankAccounts.id, id)).limit(1);
    return row ?? null;
  }

  async save(data: typeof draweeBankAccounts.$inferInsert) {
    const [row] = await this.db.insert(draweeBankAccounts).values(data).returning();
    return row!;
  }

  async update(id: string, data: Record<string, unknown>) {
    const [row] = await this.db
      .update(draweeBankAccounts)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof draweeBankAccounts.$inferInsert>)
      .where(eq(draweeBankAccounts.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string) {
    await this.db.delete(draweeBankAccounts).where(eq(draweeBankAccounts.id, id));
  }
}
