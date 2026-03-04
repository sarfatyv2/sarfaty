import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { PgfnCheckRepository } from '../../domain/pgfn-check.repository';
import { PgfnCheckResult } from '../../domain/pgfn-check-result.entity';
import { pgfnCheckResults } from '../../../../database/schema/pgfn-check-results';
import { PgfnCheckResultMapper } from '../mappers/pgfn-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzlePgfnCheckRepository implements PgfnCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: PgfnCheckResult): Promise<void> {
    const raw = PgfnCheckResultMapper.toPersistence(result);
    await this.db.insert(pgfnCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<PgfnCheckResult | null> {
    const rows = await this.db
      .select()
      .from(pgfnCheckResults)
      .where(eq(pgfnCheckResults.clientId, clientId))
      .orderBy(desc(pgfnCheckResults.queriedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }

    return PgfnCheckResultMapper.toDomain(row);
  }
}
