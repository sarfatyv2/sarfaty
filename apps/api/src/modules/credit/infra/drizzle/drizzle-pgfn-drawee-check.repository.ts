import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { PgfnDraweeCheckRepository } from '../../domain/pgfn-drawee-check.repository';
import { PgfnDraweeCheckResult } from '../../domain/pgfn-drawee-check-result.entity';
import { pgfnDraweeCheckResults } from '../../../../database/schema/pgfn-drawee-check-results';
import { PgfnDraweeCheckResultMapper } from '../mappers/pgfn-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzlePgfnDraweeCheckRepository implements PgfnDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: PgfnDraweeCheckResult): Promise<void> {
    const raw = PgfnDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(pgfnDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<PgfnDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(pgfnDraweeCheckResults)
      .where(eq(pgfnDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(pgfnDraweeCheckResults.queriedAt));

    return rows.map((r) => PgfnDraweeCheckResultMapper.toDomain(r));
  }
}
