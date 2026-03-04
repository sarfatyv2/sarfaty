import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SlaveLaborCheckRepository } from '../../domain/slave-labor-check.repository';
import { SlaveLaborCheckResult } from '../../domain/slave-labor-check-result.entity';
import { slaveLaborCheckResults } from '../../../../database/schema/slave-labor-check-results';
import { SlaveLaborCheckResultMapper } from '../mappers/slave-labor-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleSlaveLaborCheckRepository implements SlaveLaborCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: SlaveLaborCheckResult): Promise<void> {
    const raw = SlaveLaborCheckResultMapper.toPersistence(result);
    await this.db.insert(slaveLaborCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<SlaveLaborCheckResult | null> {
    const rows = await this.db
      .select()
      .from(slaveLaborCheckResults)
      .where(eq(slaveLaborCheckResults.clientId, clientId))
      .orderBy(desc(slaveLaborCheckResults.queriedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }

    return SlaveLaborCheckResultMapper.toDomain(row);
  }
}
