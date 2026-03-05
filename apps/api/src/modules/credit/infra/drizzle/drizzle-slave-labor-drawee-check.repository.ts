import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SlaveLaborDraweeCheckRepository } from '../../domain/slave-labor-drawee-check.repository';
import { SlaveLaborDraweeCheckResult } from '../../domain/slave-labor-drawee-check-result.entity';
import { slaveLaborDraweeCheckResults } from '../../../../database/schema/slave-labor-drawee-check-results';
import { SlaveLaborDraweeCheckResultMapper } from '../mappers/slave-labor-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleSlaveLaborDraweeCheckRepository implements SlaveLaborDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: SlaveLaborDraweeCheckResult): Promise<void> {
    const raw = SlaveLaborDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(slaveLaborDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<SlaveLaborDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(slaveLaborDraweeCheckResults)
      .where(eq(slaveLaborDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(slaveLaborDraweeCheckResults.queriedAt));

    return rows.map((r) => SlaveLaborDraweeCheckResultMapper.toDomain(r));
  }
}
