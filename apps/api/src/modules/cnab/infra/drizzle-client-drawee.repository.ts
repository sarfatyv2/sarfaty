import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientDrawees } from '../../../database/schema';
import type { ClientDraweeRepository, ClientDraweeRecord } from '../domain/client-drawee.repository';

@Injectable()
export class DrizzleClientDraweeRepository implements ClientDraweeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(
    clientId: string,
    draweeId: string,
    titleCount: number,
    exposure: number,
    operationDate: string,
  ): Promise<ClientDraweeRecord> {
    const [row] = await this.db
      .insert(clientDrawees)
      .values({
        clientId,
        draweeId,
        status: 'active',
        totalTitles: titleCount,
        totalExposure: String(exposure),
        firstOperationAt: operationDate,
        lastOperationAt: operationDate,
      })
      .onConflictDoUpdate({
        target: [clientDrawees.clientId, clientDrawees.draweeId],
        set: {
          totalTitles: sql`${clientDrawees.totalTitles} + ${titleCount}`,
          totalExposure: sql`${clientDrawees.totalExposure}::numeric + ${exposure}`,
          lastOperationAt: operationDate,
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.toRecord(row!); // guaranteed by INSERT ... RETURNING
  }

  async findByClientId(clientId: string): Promise<ClientDraweeRecord[]> {
    const rows = await this.db
      .select()
      .from(clientDrawees)
      .where(eq(clientDrawees.clientId, clientId));
    return rows.map(this.toRecord);
  }

  async findByDraweeId(draweeId: string): Promise<ClientDraweeRecord[]> {
    const rows = await this.db
      .select()
      .from(clientDrawees)
      .where(eq(clientDrawees.draweeId, draweeId));
    return rows.map(this.toRecord);
  }

  private toRecord(row: typeof clientDrawees.$inferSelect): ClientDraweeRecord {
    return {
      id: row.id,
      clientId: row.clientId,
      draweeId: row.draweeId,
      status: row.status,
      totalTitles: row.totalTitles,
      totalExposure: row.totalExposure,
      firstOperationAt: row.firstOperationAt,
      lastOperationAt: row.lastOperationAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
