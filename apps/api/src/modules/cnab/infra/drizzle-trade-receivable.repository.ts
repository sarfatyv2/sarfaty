import { Inject, Injectable } from '@nestjs/common';
import { eq, and, gte, lte, count, desc, inArray, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { tradeReceivables, clients } from '../../../database/schema';
import type {
  TradeReceivableRepository,
  TradeReceivableFilters,
  PaginatedTradeReceivables,
} from '../domain/trade-receivable.repository';
import { TradeReceivableEntity } from '../domain/trade-receivable.entity';
import { TradeReceivableMapper } from './mappers/trade-receivable.mapper';

@Injectable()
export class DrizzleTradeReceivableRepository implements TradeReceivableRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async saveMany(items: TradeReceivableEntity[]): Promise<TradeReceivableEntity[]> {
    if (items.length === 0) return [];

    const data = items.map((item) => TradeReceivableMapper.toPersistence(item));
    const rows = await this.db
      .insert(tradeReceivables)
      .values(data as (typeof tradeReceivables.$inferInsert)[])
      .returning();
    return rows.map(TradeReceivableMapper.toDomain);
  }

  async findById(id: string): Promise<TradeReceivableEntity | null> {
    const [row] = await this.db
      .select()
      .from(tradeReceivables)
      .where(eq(tradeReceivables.id, id))
      .limit(1);
    return row ? TradeReceivableMapper.toDomain(row) : null;
  }

  async findByCnabFileId(cnabFileId: string): Promise<TradeReceivableEntity[]> {
    const rows = await this.db
      .select()
      .from(tradeReceivables)
      .where(eq(tradeReceivables.cnabFileId, cnabFileId))
      .orderBy(tradeReceivables.cnabRecordSequence);
    return rows.map(TradeReceivableMapper.toDomain);
  }

  async findByFilters(filters: TradeReceivableFilters): Promise<PaginatedTradeReceivables> {
    const conditions = [];

    if (filters.clientId) conditions.push(eq(tradeReceivables.clientId, filters.clientId));
    if (filters.draweeId) conditions.push(eq(tradeReceivables.draweeId, filters.draweeId));
    if (filters.cnabFileId) conditions.push(eq(tradeReceivables.cnabFileId, filters.cnabFileId));
    if (filters.operationId) conditions.push(eq(tradeReceivables.operationId, filters.operationId));
    if (filters.status) conditions.push(eq(tradeReceivables.status, filters.status));
    if (filters.evaluationStatus) conditions.push(eq(tradeReceivables.evaluationStatus, filters.evaluationStatus));
    if (filters.dueDateFrom) conditions.push(gte(tradeReceivables.dueDate, filters.dueDateFrom));
    if (filters.dueDateTo) conditions.push(lte(tradeReceivables.dueDate, filters.dueDateTo));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select({
          receivable: tradeReceivables,
          clientName: clients.companyName,
        })
        .from(tradeReceivables)
        .leftJoin(clients, eq(tradeReceivables.clientId, clients.id))
        .where(whereClause)
        .orderBy(desc(tradeReceivables.dueDate))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(tradeReceivables).where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      receivables: rows.map((row) => ({
        entity: TradeReceivableMapper.toDomain(row.receivable),
        clientName: row.clientName ? String(row.clientName) : null,
      })),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async updateEvaluation(
    id: string,
    evaluationStatus: 'approved' | 'rejected',
    rejectionReason?: string | null,
  ): Promise<TradeReceivableEntity | null> {
    const [row] = await this.db
      .update(tradeReceivables)
      .set({
        evaluationStatus,
        rejectionReason: evaluationStatus === 'rejected' ? (rejectionReason ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(tradeReceivables.id, id))
      .returning();
    return row ? TradeReceivableMapper.toDomain(row) : null;
  }

  async updateOperationId(ids: string[], operationId: string): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(tradeReceivables)
      .set({ operationId, updatedAt: new Date() })
      .where(inArray(tradeReceivables.id, ids));
  }

  async sumApprovedFaceValueByOperationId(operationId: string): Promise<string> {
    const rows = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${tradeReceivables.faceValue} AS NUMERIC)), 0)::text`,
      })
      .from(tradeReceivables)
      .where(and(eq(tradeReceivables.operationId, operationId), eq(tradeReceivables.evaluationStatus, 'approved')));

    return rows[0]?.total ?? '0';
  }
}
