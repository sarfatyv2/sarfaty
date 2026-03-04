import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { PepCheckRepository } from '../../domain/pep-check.repository';
import { PepCheckResult } from '../../domain/pep-check-result.entity';
import { pepCheckResults } from '../../../../database/schema/pep-check-results';
import { PepCheckResultMapper } from '../mappers/pep-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzlePepCheckRepository implements PepCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: PepCheckResult): Promise<void> {
    const raw = PepCheckResultMapper.toPersistence(result);
    await this.db.insert(pepCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<PepCheckResult[]> {
    const rows = await this.db
      .select()
      .from(pepCheckResults)
      .where(eq(pepCheckResults.clientId, clientId))
      .orderBy(desc(pepCheckResults.queriedAt))
      .execute();

    return rows.map(row => PepCheckResultMapper.toDomain(row));
  }
}
