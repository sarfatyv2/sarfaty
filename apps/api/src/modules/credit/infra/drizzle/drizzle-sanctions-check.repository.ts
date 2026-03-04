import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SanctionsCheckRepository } from '../../domain/sanctions-check.repository';
import { SanctionsCheckResult } from '../../domain/sanctions-check-result.entity';
import { sanctionsCheckResults } from '../../../../database/schema/sanctions-check-results';
import { SanctionsCheckResultMapper } from '../mappers/sanctions-check-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleSanctionsCheckRepository implements SanctionsCheckRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: SanctionsCheckResult): Promise<void> {
    const raw = SanctionsCheckResultMapper.toPersistence(result);
    await this.db.insert(sanctionsCheckResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<SanctionsCheckResult[]> {
    const rows = await this.db
      .select()
      .from(sanctionsCheckResults)
      .where(eq(sanctionsCheckResults.clientId, clientId))
      .orderBy(desc(sanctionsCheckResults.queriedAt))
      .execute();

    return rows.map(row => SanctionsCheckResultMapper.toDomain(row));
  }
}
