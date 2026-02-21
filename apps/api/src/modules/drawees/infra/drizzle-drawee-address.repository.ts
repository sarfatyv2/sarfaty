import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { draweeAddresses } from '../../../database/schema';

export const DRAWEE_ADDRESS_REPOSITORY = Symbol('DRAWEE_ADDRESS_REPOSITORY');

export interface DraweeAddressRepository {
  findAllByDraweeId(draweeId: string): Promise<(typeof draweeAddresses.$inferSelect)[]>;
  findById(id: string): Promise<(typeof draweeAddresses.$inferSelect) | null>;
  save(data: typeof draweeAddresses.$inferInsert): Promise<typeof draweeAddresses.$inferSelect>;
  update(id: string, data: Record<string, unknown>): Promise<(typeof draweeAddresses.$inferSelect) | null>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class DrizzleDraweeAddressRepository implements DraweeAddressRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByDraweeId(draweeId: string) {
    return this.db.select().from(draweeAddresses).where(eq(draweeAddresses.draweeId, draweeId));
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(draweeAddresses).where(eq(draweeAddresses.id, id)).limit(1);
    return row ?? null;
  }

  async save(data: typeof draweeAddresses.$inferInsert) {
    const [row] = await this.db.insert(draweeAddresses).values(data).returning();
    return row!;
  }

  async update(id: string, data: Record<string, unknown>) {
    const [row] = await this.db
      .update(draweeAddresses)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof draweeAddresses.$inferInsert>)
      .where(eq(draweeAddresses.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string) {
    await this.db.delete(draweeAddresses).where(eq(draweeAddresses.id, id));
  }
}
