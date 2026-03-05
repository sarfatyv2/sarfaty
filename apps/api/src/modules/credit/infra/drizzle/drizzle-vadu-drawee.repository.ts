import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { VaduDraweeRepository } from '../../domain/vadu-drawee.repository';
import { VaduDraweeCompanyResult } from '../../domain/vadu-drawee-company-result.entity';
import { VaduDraweePersonResult } from '../../domain/vadu-drawee-person-result.entity';
import { vaduDraweeCompanyResults } from '../../../../database/schema/vadu-drawee-company-results';
import { vaduDraweePersonResults } from '../../../../database/schema/vadu-drawee-person-results';
import { VaduDraweeCompanyResultMapper } from '../mappers/vadu-drawee-company-result.mapper';
import { VaduDraweePersonResultMapper } from '../mappers/vadu-drawee-person-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleVaduDraweeRepository implements VaduDraweeRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async saveCompanyResult(result: VaduDraweeCompanyResult): Promise<void> {
    const raw = VaduDraweeCompanyResultMapper.toPersistence(result);
    await this.db.insert(vaduDraweeCompanyResults).values(raw);
  }

  async savePersonResult(result: VaduDraweePersonResult): Promise<void> {
    const raw = VaduDraweePersonResultMapper.toPersistence(result);
    await this.db.insert(vaduDraweePersonResults).values(raw);
  }

  async getLatestCompanyResult(draweeId: string): Promise<VaduDraweeCompanyResult | null> {
    const rows = await this.db
      .select()
      .from(vaduDraweeCompanyResults)
      .where(eq(vaduDraweeCompanyResults.draweeId, draweeId))
      .orderBy(desc(vaduDraweeCompanyResults.queriedAt))
      .limit(1);

    const row = rows[0];
    return row ? VaduDraweeCompanyResultMapper.toDomain(row) : null;
  }

  async getLatestPersonResults(draweeId: string): Promise<VaduDraweePersonResult[]> {
    const rows = await this.db
      .select()
      .from(vaduDraweePersonResults)
      .where(eq(vaduDraweePersonResults.draweeId, draweeId))
      .orderBy(desc(vaduDraweePersonResults.queriedAt));

    return rows.map((r) => VaduDraweePersonResultMapper.toDomain(r));
  }
}
