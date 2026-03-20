import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { GetVisitsOverviewUseCase, type VisitStatus } from '../use-cases/get-visits-overview.use-case';
import { GetTeamOverviewUseCase } from '../use-cases/get-team-overview.use-case';

@ApiTags('Visits')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly getVisitsOverviewUseCase: GetVisitsOverviewUseCase,
    private readonly getTeamOverviewUseCase: GetTeamOverviewUseCase,
  ) {}

  @Get('overview')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @ApiOperation({ summary: 'Get visit status overview for the current user\'s clients' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'Filter by sales rep profile ID (managers only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['on_track', 'approaching', 'overdue', 'never_visited'] })
  async getOverview(
    @CurrentUser() user: { sub: string; role: string },
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
  ) {
    const MANAGER_ROLES = new Set(['sales_supervisor', 'sales_manager', 'sales_director', 'admin']);
    const isManager = MANAGER_ROLES.has(user.role);

    const resolvedAssignedTo = isManager ? assignedTo : user.sub;

    const data = await this.getVisitsOverviewUseCase.execute({
      assignedTo: resolvedAssignedTo,
      statusFilter: status as VisitStatus | undefined,
    });

    return { data };
  }

  @Get('team-overview')
  @Roles('sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @ApiOperation({ summary: 'Get aggregated visit overview grouped by commercial rep (managers only)' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiQuery({ name: 'regionId', required: false, type: String })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  async getTeamOverview(
    @Query('teamId') teamId?: string,
    @Query('regionId') regionId?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    const data = await this.getTeamOverviewUseCase.execute({ teamId, regionId, assignedTo });
    return { data };
  }
}
