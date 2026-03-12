import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { AllcheckResultRepository } from '../../domain/allcheck-result.repository';
import { AllcheckResult } from '../../domain/allcheck-result.entity';
import { allcheckResults } from '../../../../database/schema/allcheck-results';
import { AllcheckResultMapper } from '../mappers/allcheck-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleAllcheckResultRepository implements AllcheckResultRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: AllcheckResult): Promise<void> {
    const raw = AllcheckResultMapper.toPersistence(result);
    await this.db.insert(allcheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<AllcheckResult | null> {
    const [row] = await this.db
      .select()
      .from(allcheckResults)
      .where(eq(allcheckResults.clientId, clientId))
      .orderBy(desc(allcheckResults.queriedAt))
      .limit(1)
      .execute();

    return row ? AllcheckResultMapper.toDomain(row) : null;
  }
}
