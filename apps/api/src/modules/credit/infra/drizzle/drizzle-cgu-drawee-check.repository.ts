import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CguDraweeCheckRepository } from '../../domain/cgu-drawee-check.repository';
import { CguDraweeCheckResult } from '../../domain/cgu-drawee-check-result.entity';
import { cguDraweeCheckResults } from '../../../../database/schema/cgu-drawee-check-results';
import { CguDraweeCheckResultMapper } from '../mappers/cgu-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleCguDraweeCheckRepository implements CguDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: CguDraweeCheckResult): Promise<void> {
    const raw = CguDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(cguDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<CguDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(cguDraweeCheckResults)
      .where(eq(cguDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(cguDraweeCheckResults.queriedAt));

    return rows.map((r) => CguDraweeCheckResultMapper.toDomain(r));
  }
}
