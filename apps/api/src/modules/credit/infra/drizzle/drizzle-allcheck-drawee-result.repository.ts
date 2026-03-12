import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { AllcheckDraweeResultRepository } from '../../domain/allcheck-drawee-result.repository';
import { AllcheckDraweeResult } from '../../domain/allcheck-drawee-result.entity';
import { allcheckDraweeResults } from '../../../../database/schema/allcheck-drawee-results';
import { AllcheckDraweeResultMapper } from '../mappers/allcheck-drawee-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleAllcheckDraweeResultRepository implements AllcheckDraweeResultRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: AllcheckDraweeResult): Promise<void> {
    const raw = AllcheckDraweeResultMapper.toPersistence(result);
    await this.db.insert(allcheckDraweeResults).values(raw).execute();
  }

  async getLatestByDraweeId(draweeId: string): Promise<AllcheckDraweeResult | null> {
    const [row] = await this.db
      .select()
      .from(allcheckDraweeResults)
      .where(eq(allcheckDraweeResults.draweeId, draweeId))
      .orderBy(desc(allcheckDraweeResults.queriedAt))
      .limit(1)
      .execute();

    return row ? AllcheckDraweeResultMapper.toDomain(row) : null;
  }
}
