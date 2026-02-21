import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CreditboxRepository } from '../../domain/creditbox.repository';
import { CreditboxReport } from '../../domain/creditbox-report.entity';
import { CreditboxReportMapper } from '../mappers/creditbox-report.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { creditboxReports } from '../../../../database/schema/creditbox-reports';

@Injectable()
export class DrizzleCreditboxRepository implements CreditboxRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(report: CreditboxReport): Promise<void> {
    const data = CreditboxReportMapper.toPersistence(report);
    await this.db.insert(creditboxReports).values(data).execute();
  }

  async update(report: CreditboxReport): Promise<void> {
    const data = CreditboxReportMapper.toPersistence(report);
    await this.db
      .update(creditboxReports)
      .set({
        status: data.status,
        processId: data.processId,
        reportJson: data.reportJson,
        pdfBase64: data.pdfBase64,
        errorMessage: data.errorMessage,
        completedAt: data.completedAt,
      })
      .where(eq(creditboxReports.id, data.id))
      .execute();
  }

  async getLatestByClientId(clientId: string): Promise<CreditboxReport | null> {
    const rows = await this.db
      .select()
      .from(creditboxReports)
      .where(eq(creditboxReports.clientId, clientId))
      .orderBy(desc(creditboxReports.requestedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }
    return CreditboxReportMapper.toDomain(row);
  }

  async getByProcessId(processId: string): Promise<CreditboxReport | null> {
    const rows = await this.db
      .select()
      .from(creditboxReports)
      .where(eq(creditboxReports.processId, processId))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }
    return CreditboxReportMapper.toDomain(row);
  }
}
