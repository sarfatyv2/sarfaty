import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { listAuditLogsQuerySchema, type ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { ListAuditLogsUseCase } from '../use-cases/list-audit-logs.use-case';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private readonly listAuditLogsUseCase: ListAuditLogsUseCase) {}

  @Get()
  @Roles('admin', 'compliance_officer')
  async list(
    @Query(new ZodValidationPipe(listAuditLogsQuerySchema)) query: ListAuditLogsQueryDto,
  ) {
    const result = await this.listAuditLogsUseCase.execute(query);
    return {
      data: result.logs,
      pagination: result.pagination,
    };
  }
}
