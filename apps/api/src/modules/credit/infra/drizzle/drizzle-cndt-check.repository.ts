import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CndtCheckRepository } from '../../domain/cndt-check.repository';
import { CndtCheckResult } from '../../domain/cndt-check-result.entity';
import { cndtCheckResults } from '../../../../database/schema/cndt-check-results';
import { CndtCheckResultMapper } from '../mappers/cndt-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleCndtCheckRepository implements CndtCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: CndtCheckResult): Promise<void> {
    const raw = CndtCheckResultMapper.toPersistence(result);
    await this.db.insert(cndtCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<CndtCheckResult | null> {
    const rows = await this.db
      .select()
      .from(cndtCheckResults)
      .where(eq(cndtCheckResults.clientId, clientId))
      .orderBy(desc(cndtCheckResults.queriedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }

    return CndtCheckResultMapper.toDomain(row);
  }
}
