import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { CommercialReportRepository } from '../../domain/commercial-report.repository';
import { CommercialReportEntity } from '../../domain/commercial-report.entity';
import { CommercialReportMapper } from '../mappers/commercial-report.mapper';
import { clientCommercialReports } from '../../../../database/schema/client-commercial-reports';
import { commercialReportProposals } from '../../../../database/schema/commercial-report-proposals';
import { commercialReportGuarantors } from '../../../../database/schema/commercial-report-guarantors';
import { commercialReportProperties } from '../../../../database/schema/commercial-report-properties';
import { asc, desc, eq, inArray, sql } from 'drizzle-orm';

function groupByReportId<T extends { reportId: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.reportId) ?? [];
    list.push(row);
    map.set(row.reportId, list);
  }
  return map;
}

@Injectable()
export class DrizzleCommercialReportRepository implements CommercialReportRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(entity: CommercialReportEntity): Promise<CommercialReportEntity> {
    const raw = CommercialReportMapper.toPersistenceMain(entity);

    await this.db.transaction(async (tx) => {
      await tx.insert(clientCommercialReports).values(raw as typeof clientCommercialReports.$inferInsert);

      if (entity.proposals.length > 0) {
        await tx.insert(commercialReportProposals).values(
          entity.proposals.map((p) => ({
            id: p.id,
            reportId: p.reportId,
            modality: p.modality,
            limitAmount: p.limitAmount != null ? String(p.limitAmount) : null,
            guarantee: p.guarantee,
            rate: p.rate,
            concentrationPct: p.concentrationPct != null ? String(p.concentrationPct) : null,
            term: p.term,
            tranche: p.tranche,
            tacValue: p.tacValue != null ? String(p.tacValue) : null,
            boletoTariff: p.boletoTariff != null ? String(p.boletoTariff) : null,
            tedValue: p.tedValue != null ? String(p.tedValue) : null,
            serasa: p.serasa,
            sortOrder: p.sortOrder,
          })),
        );
      }

      if (entity.guarantors.length > 0) {
        await tx.insert(commercialReportGuarantors).values(
          entity.guarantors.map((g) => ({
            id: g.id,
            reportId: g.reportId,
            fullName: g.fullName,
            cpf: g.cpf,
            sortOrder: g.sortOrder,
          })),
        );
      }

      if (entity.properties.length > 0) {
        await tx.insert(commercialReportProperties).values(
          entity.properties.map((p) => ({
            id: p.id,
            reportId: p.reportId,
            propertyName: p.propertyName,
            situation: p.situation,
            totalArea: p.totalArea,
            builtArea: p.builtArea,
            appraisedValue: p.appraisedValue != null ? String(p.appraisedValue) : null,
            sortOrder: p.sortOrder,
          })),
        );
      }
    });

    const loaded = await this.findByReportIdInternal(entity.id);
    if (!loaded) {
      throw new Error(`Commercial report not found after save: ${entity.id}`);
    }
    return loaded;
  }

  private async findByReportIdInternal(reportId: string): Promise<CommercialReportEntity | null> {
    const [row] = await this.db
      .select()
      .from(clientCommercialReports)
      .where(eq(clientCommercialReports.id, reportId))
      .limit(1);

    if (!row) return null;

    const bundles = await this.loadChildrenForReports([reportId]);
    return CommercialReportMapper.toDomain(row as Record<string, unknown>, bundles.get(reportId)!);
  }

  private async loadChildrenForReports(
    reportIds: string[],
  ): Promise<Map<string, { proposals: Record<string, unknown>[]; guarantors: Record<string, unknown>[]; properties: Record<string, unknown>[] }>> {
    const emptyBundle = (): {
      proposals: Record<string, unknown>[];
      guarantors: Record<string, unknown>[];
      properties: Record<string, unknown>[];
    } => ({ proposals: [], guarantors: [], properties: [] });

    const result = new Map<string, ReturnType<typeof emptyBundle>>();
    for (const id of reportIds) {
      result.set(id, emptyBundle());
    }

    if (reportIds.length === 0) return result;

    const [proposalRows, guarantorRows, propertyRows] = await Promise.all([
      this.db
        .select()
        .from(commercialReportProposals)
        .where(inArray(commercialReportProposals.reportId, reportIds))
        .orderBy(asc(commercialReportProposals.sortOrder)),
      this.db
        .select()
        .from(commercialReportGuarantors)
        .where(inArray(commercialReportGuarantors.reportId, reportIds))
        .orderBy(asc(commercialReportGuarantors.sortOrder)),
      this.db
        .select()
        .from(commercialReportProperties)
        .where(inArray(commercialReportProperties.reportId, reportIds))
        .orderBy(asc(commercialReportProperties.sortOrder)),
    ]);

    const proposalsByReport = groupByReportId(proposalRows as { reportId: string }[]);
    const guarantorsByReport = groupByReportId(guarantorRows as { reportId: string }[]);
    const propertiesByReport = groupByReportId(propertyRows as { reportId: string }[]);

    for (const reportId of reportIds) {
      const bundle = result.get(reportId)!;
      bundle.proposals = (proposalsByReport.get(reportId) ?? []) as Record<string, unknown>[];
      bundle.guarantors = (guarantorsByReport.get(reportId) ?? []) as Record<string, unknown>[];
      bundle.properties = (propertiesByReport.get(reportId) ?? []) as Record<string, unknown>[];
    }

    return result;
  }

  async findByClientId(clientId: string): Promise<CommercialReportEntity[]> {
    const rows = await this.db
      .select()
      .from(clientCommercialReports)
      .where(eq(clientCommercialReports.clientId, clientId))
      .orderBy(desc(clientCommercialReports.createdAt));

    const ids = rows.map((r) => r.id);
    const bundles = await this.loadChildrenForReports(ids);

    return rows.map((row) =>
      CommercialReportMapper.toDomain(row as Record<string, unknown>, bundles.get(row.id)!),
    );
  }

  async findLatestByClientId(clientId: string): Promise<CommercialReportEntity | null> {
    const [row] = await this.db
      .select()
      .from(clientCommercialReports)
      .where(eq(clientCommercialReports.clientId, clientId))
      .orderBy(desc(clientCommercialReports.createdAt))
      .limit(1);

    if (!row) return null;

    const bundles = await this.loadChildrenForReports([row.id]);
    return CommercialReportMapper.toDomain(row as Record<string, unknown>, bundles.get(row.id)!);
  }

  async findLatestVisitDateByClientIds(clientIds: string[]): Promise<Record<string, string | null>> {
    if (clientIds.length === 0) return {};

    const rows = await this.db
      .select({
        clientId: clientCommercialReports.clientId,
        latestVisitDate: sql<string | null>`MAX(${clientCommercialReports.visitDate})`,
      })
      .from(clientCommercialReports)
      .where(inArray(clientCommercialReports.clientId, clientIds))
      .groupBy(clientCommercialReports.clientId);

    const result: Record<string, string | null> = {};
    for (const row of rows) {
      result[row.clientId] = row.latestVisitDate ?? null;
    }
    return result;
  }
}
