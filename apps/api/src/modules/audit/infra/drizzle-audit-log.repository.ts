import { Inject, Injectable } from '@nestjs/common';
import { eq, and, gte, lte, desc, asc, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { auditLogs } from '../../../database/schema/audit';
import type {
  AuditLogFilters,
  AuditLogRecord,
  AuditLogRepository,
  PaginatedAuditLogs,
} from '../domain/audit-log.repository';

@Injectable()
export class DrizzleAuditLogRepository implements AuditLogRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByFilters(filters: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const conditions = [];

    if (filters.actorId) {
      conditions.push(eq(auditLogs.actorId, filters.actorId));
    }
    if (filters.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogs.entityId, filters.entityId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.dateFrom) {
      conditions.push(gte(auditLogs.createdAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(auditLogs.createdAt, new Date(filters.dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(orderFn(auditLogs.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(auditLogs)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      logs: rows.map((row) => this.toRecord(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  private toRecord(row: typeof auditLogs.$inferSelect): AuditLogRecord {
    return {
      id: row.id,
      correlationId: row.correlationId,
      actorId: row.actorId,
      actorRole: row.actorRole,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId ?? null,
      httpMethod: row.httpMethod,
      path: row.path,
      payload: row.payload ?? null,
      metadata: (row.metadata as Record<string, unknown> | null) ?? null,
      createdAt: row.createdAt,
    };
  }
}
