import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { SerasaDraweeReportRepository } from '../../domain/serasa-drawee-report.repository';
import { SerasaDraweeReport } from '../../domain/serasa-drawee-report.entity';
import { SerasaDraweeReportMapper } from '../mappers/serasa-drawee-report.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { serasaDraweeReportResults } from '../../../../database/schema/serasa-drawee-report-results';

@Injectable()
export class DrizzleSerasaDraweeReportRepository implements SerasaDraweeReportRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(report: SerasaDraweeReport): Promise<void> {
    const data = SerasaDraweeReportMapper.toPersistence(report);
    await this.db.insert(serasaDraweeReportResults).values(data);
  }

  async getLatestByDraweeId(draweeId: string): Promise<SerasaDraweeReport | null> {
    const rows = await this.db
      .select()
      .from(serasaDraweeReportResults)
      .where(eq(serasaDraweeReportResults.draweeId, draweeId))
      .orderBy(desc(serasaDraweeReportResults.createdAt))
      .limit(1);

    const row = rows[0];
    return row ? SerasaDraweeReportMapper.toDomain(row) : null;
  }

  async getByDraweeId(draweeId: string): Promise<SerasaDraweeReport[]> {
    const rows = await this.db
      .select()
      .from(serasaDraweeReportResults)
      .where(eq(serasaDraweeReportResults.draweeId, draweeId))
      .orderBy(desc(serasaDraweeReportResults.createdAt));

    return rows.map(SerasaDraweeReportMapper.toDomain);
  }
}
