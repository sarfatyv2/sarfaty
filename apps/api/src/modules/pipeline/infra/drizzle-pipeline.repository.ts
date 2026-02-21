import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql, notInArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema/clients';
import type { PipelineRepository, PipelineFilters, PipelineClientRow, MetricsRow } from '../domain/pipeline.repository';
import type { ClientStatus } from '@nexus/types';

const TERMINAL_STATUSES: ClientStatus[] = ['settled'];

@Injectable()
export class DrizzlePipelineRepository implements PipelineRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getClients(filters: PipelineFilters): Promise<PipelineClientRow[]> {
    const conditions = [
      notInArray(clients.status, TERMINAL_STATUSES),
    ];

    if (filters.assignedTo) conditions.push(eq(clients.assignedTo, filters.assignedTo));
    if (filters.teamId) conditions.push(eq(clients.teamId, filters.teamId));
    if (filters.regionId) conditions.push(eq(clients.regionId, filters.regionId));
    if (filters.segmentId) conditions.push(eq(clients.segmentId, filters.segmentId));

    const rows = await this.db
      .select({
        id: clients.id,
        companyName: clients.companyName,
        cnpj: clients.cnpj,
        tradeName: clients.tradeName,
        segmentId: clients.segmentId,
        requestedAmount: clients.requestedAmount,
        approvedAmount: clients.approvedAmount,
        status: clients.status,
        assignedTo: clients.assignedTo,
        teamId: clients.teamId,
        regionId: clients.regionId,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        submittedAt: clients.submittedAt,
      })
      .from(clients)
      .where(and(...conditions))
      .orderBy(clients.createdAt);

    return rows as PipelineClientRow[];
  }

  async getMetrics(filters: PipelineFilters): Promise<MetricsRow> {
    const conditions = [];
    if (filters.assignedTo) conditions.push(eq(clients.assignedTo, filters.assignedTo));
    if (filters.teamId) conditions.push(eq(clients.teamId, filters.teamId));
    if (filters.regionId) conditions.push(eq(clients.regionId, filters.regionId));
    if (filters.segmentId) conditions.push(eq(clients.segmentId, filters.segmentId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [row] = await this.db
      .select({
        countProspecting: sql<number>`count(*) filter (where ${clients.status} = 'draft')`,
        countDocumentation: sql<number>`count(*) filter (where ${clients.status} in ('pending_documents', 'document_issues'))`,
        countAnalysis: sql<number>`count(*) filter (where ${clients.status} in ('document_validation', 'credit_analysis'))`,
        countApproval: sql<number>`count(*) filter (where ${clients.status} in ('pending_report', 'pending_approval'))`,
        countApproved: sql<number>`count(*) filter (where ${clients.status} in ('approved', 'pending_partner_docs', 'partner_doc_validation'))`,
        countActive: sql<number>`count(*) filter (where ${clients.status} in ('pending_homologation', 'homologated', 'active'))`,
        countLost: sql<number>`count(*) filter (where ${clients.status} in ('auto_rejected', 'rejected', 'cancelled'))`,
        countTotal: sql<number>`count(*)`,
        totalPipelineAmount: sql<string>`coalesce(sum(${clients.requestedAmount}) filter (where ${clients.status} not in ('auto_rejected', 'rejected', 'cancelled')), 0)`,
        totalApprovedAmount: sql<string>`coalesce(sum(${clients.approvedAmount}) filter (where ${clients.approvedAmount} is not null), 0)`,
        avgHoursToSubmit: sql<number | null>`avg(extract(epoch from (${clients.submittedAt} - ${clients.createdAt})) / 3600) filter (where ${clients.submittedAt} is not null)`,
        avgHoursToApprove: sql<number | null>`avg(extract(epoch from (${clients.approvedAt} - ${clients.submittedAt})) / 3600) filter (where ${clients.approvedAt} is not null)`,
      })
      .from(clients)
      .where(whereClause);

    return row!;
  }
}
