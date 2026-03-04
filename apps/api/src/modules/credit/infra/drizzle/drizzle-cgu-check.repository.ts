import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CguCheckRepository } from '../../domain/cgu-check.repository';
import { CguCheckResult } from '../../domain/cgu-check-result.entity';
import { cguCheckResults } from '../../../../database/schema/cgu-check-results';
import { CguCheckResultMapper } from '../mappers/cgu-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleCguCheckRepository implements CguCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: CguCheckResult): Promise<void> {
    const raw = CguCheckResultMapper.toPersistence(result);
    await this.db.insert(cguCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<CguCheckResult[]> {
    const rows = await this.db
      .select()
      .from(cguCheckResults)
      .where(eq(cguCheckResults.clientId, clientId))
      .orderBy(desc(cguCheckResults.queriedAt))
      .execute();

    return rows.map(row => CguCheckResultMapper.toDomain(row));
  }
}
