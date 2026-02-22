import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { CommercialReportRepository } from '../../domain/commercial-report.repository';
import { CommercialReportEntity } from '../../domain/commercial-report.entity';
import { CommercialReportMapper } from '../mappers/commercial-report.mapper';
import { clientCommercialReports } from '../../../../database/schema/client-commercial-reports';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class DrizzleCommercialReportRepository implements CommercialReportRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(entity: CommercialReportEntity): Promise<CommercialReportEntity> {
    const raw = CommercialReportMapper.toPersistence(entity);
    const [saved] = await this.db
      .insert(clientCommercialReports)
      .values(raw)
      .returning();
      
    return CommercialReportMapper.toDomain(saved);
  }

  async findByClientId(clientId: string): Promise<CommercialReportEntity[]> {
    const rows = await this.db
      .select()
      .from(clientCommercialReports)
      .where(eq(clientCommercialReports.clientId, clientId))
      .orderBy(desc(clientCommercialReports.createdAt));
      
    return rows.map((row: any) => CommercialReportMapper.toDomain(row));
  }

  async findLatestByClientId(clientId: string): Promise<CommercialReportEntity | null> {
    const [row] = await this.db
      .select()
      .from(clientCommercialReports)
      .where(eq(clientCommercialReports.clientId, clientId))
      .orderBy(desc(clientCommercialReports.createdAt))
      .limit(1);
      
    return row ? CommercialReportMapper.toDomain(row) : null;
  }
}