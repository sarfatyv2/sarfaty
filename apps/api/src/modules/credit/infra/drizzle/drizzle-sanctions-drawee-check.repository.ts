import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SanctionsDraweeCheckRepository } from '../../domain/sanctions-drawee-check.repository';
import { SanctionsDraweeCheckResult } from '../../domain/sanctions-drawee-check-result.entity';
import { sanctionsDraweeCheckResults } from '../../../../database/schema/sanctions-drawee-check-results';
import { SanctionsDraweeCheckResultMapper } from '../mappers/sanctions-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleSanctionsDraweeCheckRepository implements SanctionsDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: SanctionsDraweeCheckResult): Promise<void> {
    const raw = SanctionsDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(sanctionsDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<SanctionsDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(sanctionsDraweeCheckResults)
      .where(eq(sanctionsDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(sanctionsDraweeCheckResults.queriedAt));

    return rows.map((r) => SanctionsDraweeCheckResultMapper.toDomain(r));
  }
}
