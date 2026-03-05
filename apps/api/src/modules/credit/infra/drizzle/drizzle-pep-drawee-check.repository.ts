import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { PepDraweeCheckRepository } from '../../domain/pep-drawee-check.repository';
import { PepDraweeCheckResult } from '../../domain/pep-drawee-check-result.entity';
import { pepDraweeCheckResults } from '../../../../database/schema/pep-drawee-check-results';
import { PepDraweeCheckResultMapper } from '../mappers/pep-drawee-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzlePepDraweeCheckRepository implements PepDraweeCheckRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: PepDraweeCheckResult): Promise<void> {
    const raw = PepDraweeCheckResultMapper.toPersistence(result);
    await this.db.insert(pepDraweeCheckResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<PepDraweeCheckResult[]> {
    const rows = await this.db
      .select()
      .from(pepDraweeCheckResults)
      .where(eq(pepDraweeCheckResults.draweeId, draweeId))
      .orderBy(desc(pepDraweeCheckResults.queriedAt));

    return rows.map((r) => PepDraweeCheckResultMapper.toDomain(r));
  }
}
