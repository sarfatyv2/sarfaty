import type { PaginationMeta } from '@nexus/types';

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface AuditLogRecord {
  id: string;
  correlationId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  httpMethod: string;
  path: string;
  payload: unknown;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AuditLogFilters {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedAuditLogs {
  logs: AuditLogRecord[];
  pagination: PaginationMeta;
}

export interface AuditLogRepository {
  findByFilters(filters: AuditLogFilters): Promise<PaginatedAuditLogs>;
}
