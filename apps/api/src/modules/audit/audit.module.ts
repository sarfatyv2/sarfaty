import { Module } from '@nestjs/common';
import { AuditController } from './controllers/audit.controller';
import { ListAuditLogsUseCase } from './use-cases/list-audit-logs.use-case';
import { DrizzleAuditLogRepository } from './infra/drizzle-audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './domain/audit-log.repository';

@Module({
  controllers: [AuditController],
  providers: [
    ListAuditLogsUseCase,
    { provide: AUDIT_LOG_REPOSITORY, useClass: DrizzleAuditLogRepository },
  ],
})
export class AuditTrailModule {}
