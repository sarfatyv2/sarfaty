import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, isNotNull } from 'drizzle-orm';
import { type UpminerResultRepository } from '../../domain/upminer-result.repository';
import { type UpminerResult } from '../../domain/upminer-result.entity';
import { UpminerResultMapper } from '../mappers/upminer-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { upminerResults } from '../../../../database/schema/upminer-results';

@Injectable()
export class DrizzleUpminerResultRepository implements UpminerResultRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: UpminerResult): Promise<void> {
    const data = UpminerResultMapper.toPersistence(result);
    await this.db.insert(upminerResults).values(data).execute();
  }

  async update(result: UpminerResult): Promise<void> {
    const data = UpminerResultMapper.toPersistence(result);
    await this.db
      .update(upminerResults)
      .set({
        batchId: data.batchId,
        status: data.status,
        dossiersData: data.dossiersData,
        errorMessage: data.errorMessage,
        processedAt: data.processedAt,
      })
      .where(eq(upminerResults.id, result.id))
      .execute();
  }

  async getLatestByClientId(clientId: string): Promise<UpminerResult | null> {
    const rows = await this.db
      .select()
      .from(upminerResults)
      .where(eq(upminerResults.clientId, clientId))
      .orderBy(desc(upminerResults.requestedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    return row ? UpminerResultMapper.toDomain(row) : null;
  }

  async getByBatchId(batchId: number): Promise<UpminerResult | null> {
    const rows = await this.db
      .select()
      .from(upminerResults)
      .where(eq(upminerResults.batchId, batchId))
      .limit(1)
      .execute();

    const row = rows[0];
    return row ? UpminerResultMapper.toDomain(row) : null;
  }

  async getByClientId(clientId: string): Promise<UpminerResult[]> {
    const rows = await this.db
      .select()
      .from(upminerResults)
      .where(eq(upminerResults.clientId, clientId))
      .orderBy(desc(upminerResults.requestedAt))
      .execute();

    return rows.map(UpminerResultMapper.toDomain);
  }

  async getPending(): Promise<UpminerResult[]> {
    const rows = await this.db
      .select()
      .from(upminerResults)
      .where(isNotNull(upminerResults.batchId))
      .orderBy(desc(upminerResults.requestedAt))
      .execute();

    return rows
      .map(UpminerResultMapper.toDomain)
      .filter((r) => !r.isTerminal());
  }
}
