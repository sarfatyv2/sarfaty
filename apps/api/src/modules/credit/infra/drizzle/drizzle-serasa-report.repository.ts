import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SerasaReportRepository } from '../../domain/serasa-report.repository';
import { SerasaReport } from '../../domain/serasa-report.entity';
import { SerasaReportMapper } from '../mappers/serasa-report.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { serasaReportResults } from '../../../../database/schema/serasa-report-results';

@Injectable()
export class DrizzleSerasaReportRepository implements SerasaReportRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(report: SerasaReport): Promise<void> {
    const data = SerasaReportMapper.toPersistence(report);
    await this.db.insert(serasaReportResults).values(data).execute();
  }

  async getLatestByClientId(clientId: string): Promise<SerasaReport | null> {
    const rows = await this.db
      .select()
      .from(serasaReportResults)
      .where(eq(serasaReportResults.clientId, clientId))
      .orderBy(desc(serasaReportResults.createdAt))
      .limit(1)
      .execute();

    const row = rows[0];
    return row ? SerasaReportMapper.toDomain(row) : null;
  }

  async getByClientId(clientId: string): Promise<SerasaReport[]> {
    const rows = await this.db
      .select()
      .from(serasaReportResults)
      .where(eq(serasaReportResults.clientId, clientId))
      .orderBy(desc(serasaReportResults.createdAt))
      .execute();

    return rows.map(SerasaReportMapper.toDomain);
  }
}
