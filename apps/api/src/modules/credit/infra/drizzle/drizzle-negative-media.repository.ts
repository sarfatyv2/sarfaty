import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { NegativeMediaRepository } from '../../domain/negative-media.repository';
import { NegativeMediaResult } from '../../domain/negative-media-result.entity';
import { negativeMediaResults } from '../../../../database/schema/negative-media-results';
import { NegativeMediaResultMapper } from '../mappers/negative-media-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleNegativeMediaRepository implements NegativeMediaRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: NegativeMediaResult): Promise<void> {
    const raw = NegativeMediaResultMapper.toPersistence(result);
    await this.db.insert(negativeMediaResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<NegativeMediaResult | null> {
    const rows = await this.db
      .select()
      .from(negativeMediaResults)
      .where(eq(negativeMediaResults.clientId, clientId))
      .orderBy(desc(negativeMediaResults.queriedAt))
      .limit(1)
      .execute();

    return rows.length > 0 ? NegativeMediaResultMapper.toDomain(rows[0]!) : null;
  }

  async getAllByClientId(clientId: string): Promise<NegativeMediaResult[]> {
    const rows = await this.db
      .select()
      .from(negativeMediaResults)
      .where(eq(negativeMediaResults.clientId, clientId))
      .orderBy(desc(negativeMediaResults.queriedAt))
      .execute();

    return rows.map((row) => NegativeMediaResultMapper.toDomain(row));
  }
}
