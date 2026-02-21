import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { pipelineQuerySchema, type PipelineQueryDto } from '../dto/pipeline-query.dto';
import { GetPipelineClientsUseCase } from '../use-cases/get-pipeline-clients.use-case';
import { GetPipelineMetricsUseCase } from '../use-cases/get-pipeline-metrics.use-case';
import type { Role } from '@nexus/types';
import type { PipelineFilters } from '../domain/pipeline.repository';

const ALLOWED_ROLES: Role[] = [
  'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
  'credit_analyst', 'admin',
];

@ApiTags('Pipeline')
@ApiBearerAuth()
@Controller('pipeline')
@UseGuards(RolesGuard)
export class PipelineController {
  constructor(
    private readonly getPipelineClientsUseCase: GetPipelineClientsUseCase,
    private readonly getPipelineMetricsUseCase: GetPipelineMetricsUseCase,
  ) {}

  @Get()
  @Roles(...ALLOWED_ROLES)
  async getClients(
    @Query(new ZodValidationPipe(pipelineQuerySchema)) query: PipelineQueryDto,
    @CurrentUser() user: { id: string; user_metadata: { role: Role; team_id?: string; region_id?: string } },
  ) {
    const filters = this.buildFilters(query, user);
    const stages = await this.getPipelineClientsUseCase.execute(filters);
    return { data: { stages } };
  }

  @Get('metrics')
  @Roles(...ALLOWED_ROLES)
  async getMetrics(
    @Query(new ZodValidationPipe(pipelineQuerySchema)) query: PipelineQueryDto,
    @CurrentUser() user: { id: string; user_metadata: { role: Role; team_id?: string; region_id?: string } },
  ) {
    const filters = this.buildFilters(query, user);
    const metrics = await this.getPipelineMetricsUseCase.execute(filters);
    return { data: metrics };
  }

  private buildFilters(
    query: PipelineQueryDto,
    user: { id: string; user_metadata: { role: Role; team_id?: string; region_id?: string } },
  ): PipelineFilters {
    const filters: PipelineFilters = {};

    if (query.segmentId) filters.segmentId = query.segmentId;

    switch (user.user_metadata.role) {
      case 'admin':
      case 'sales_director':
        if (query.teamId) filters.teamId = query.teamId;
        if (query.regionId) filters.regionId = query.regionId;
        break;

      case 'sales_manager':
        filters.regionId = query.regionId ?? user.user_metadata.region_id;
        break;

      case 'sales_supervisor':
        filters.teamId = query.teamId ?? user.user_metadata.team_id;
        break;

      case 'credit_analyst':
        break;

      default:
        filters.assignedTo = user.id;
        break;
    }

    return filters;
  }
}
