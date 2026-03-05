import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { NegativeMediaDraweeResultRepository } from '../../domain/negative-media-drawee-result.repository';
import { NegativeMediaDraweeResult } from '../../domain/negative-media-drawee-result.entity';
import { negativeMediaDraweeResults } from '../../../../database/schema/negative-media-drawee-results';
import { NegativeMediaDraweeResultMapper } from '../mappers/negative-media-drawee-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleNegativeMediaDraweeResultRepository implements NegativeMediaDraweeResultRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: NegativeMediaDraweeResult): Promise<void> {
    const raw = NegativeMediaDraweeResultMapper.toPersistence(result);
    await this.db.insert(negativeMediaDraweeResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<NegativeMediaDraweeResult | null> {
    const rows = await this.db
      .select()
      .from(negativeMediaDraweeResults)
      .where(eq(negativeMediaDraweeResults.draweeId, draweeId))
      .orderBy(desc(negativeMediaDraweeResults.queriedAt))
      .limit(1);

    return rows.length > 0 ? NegativeMediaDraweeResultMapper.toDomain(rows[0]!) : null;
  }

  async getAllByDraweeId(draweeId: string): Promise<NegativeMediaDraweeResult[]> {
    const rows = await this.db
      .select()
      .from(negativeMediaDraweeResults)
      .where(eq(negativeMediaDraweeResults.draweeId, draweeId))
      .orderBy(desc(negativeMediaDraweeResults.queriedAt));

    return rows.map((row) => NegativeMediaDraweeResultMapper.toDomain(row));
  }
}
