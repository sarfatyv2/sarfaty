import { Inject, Injectable } from '@nestjs/common';
import type { ListAuditLogsQueryDto } from '@nexus/validators';
import {
  AUDIT_LOG_REPOSITORY,
  type AuditLogRepository,
  type PaginatedAuditLogs,
} from '../domain/audit-log.repository';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(query: ListAuditLogsQueryDto): Promise<PaginatedAuditLogs> {
    return this.auditLogRepository.findByFilters({
      actorId: query.actorId,
      entityType: query.entityType,
      entityId: query.entityId,
      action: query.action,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
  }
}
