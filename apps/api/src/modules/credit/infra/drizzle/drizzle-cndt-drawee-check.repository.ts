import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CndtDraweeCheckRepository } from '../../domain/cndt-drawee-check.repository';
import { CndtDraweeCheckResult } from '../../domain/cndt-drawee-check-result.entity';
import { cndtDraweeCheckResults } from '../../../../database/schema/cndt-drawee-check-results';
import { CndtDraweeCheckResultMapper } from '../mappers/cndt-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleCndtDraweeCheckRepository implements CndtDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: CndtDraweeCheckResult): Promise<void> {
    const raw = CndtDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(cndtDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<CndtDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(cndtDraweeCheckResults)
      .where(eq(cndtDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(cndtDraweeCheckResults.queriedAt));

    return rows.map((r) => CndtDraweeCheckResultMapper.toDomain(r));
  }
}
