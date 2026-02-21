import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { VaduRepository } from '../../domain/vadu.repository';
import { VaduCompanyResult } from '../../domain/vadu-company-result.entity';
import { VaduPersonResult } from '../../domain/vadu-person-result.entity';
import { vaduCompanyResults } from '../../../../database/schema/vadu-company-results';
import { vaduPersonResults } from '../../../../database/schema/vadu-person-results';
import { VaduCompanyResultMapper } from '../mappers/vadu-company-result.mapper';
import { VaduPersonResultMapper } from '../mappers/vadu-person-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleVaduRepository implements VaduRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async saveCompanyResult(result: VaduCompanyResult): Promise<void> {
    const raw = VaduCompanyResultMapper.toPersistence(result);
    await this.db.insert(vaduCompanyResults).values(raw).execute();
  }

  async savePersonResult(result: VaduPersonResult): Promise<void> {
    const raw = VaduPersonResultMapper.toPersistence(result);
    await this.db.insert(vaduPersonResults).values(raw).execute();
  }

  async getLatestCompanyResult(clientId: string): Promise<VaduCompanyResult | null> {
    const rows = await this.db
      .select()
      .from(vaduCompanyResults)
      .where(eq(vaduCompanyResults.clientId, clientId))
      .orderBy(desc(vaduCompanyResults.queriedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }

    return VaduCompanyResultMapper.toDomain(row);
  }

  async getLatestPersonResults(clientId: string): Promise<VaduPersonResult[]> {
    // For persons, we might have multiple people per client.
    // Ideally we want the latest for each person, but for now we'll fetch all sorted by date.
    // The orchestration layer or frontend can group them.
    const rows = await this.db
      .select()
      .from(vaduPersonResults)
      .where(eq(vaduPersonResults.clientId, clientId))
      .orderBy(desc(vaduPersonResults.queriedAt))
      .execute();

    return rows.map(row => VaduPersonResultMapper.toDomain(row));
  }
}
