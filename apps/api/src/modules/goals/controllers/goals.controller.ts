import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createGoalSchema, type CreateGoalDto } from '../dto/create-goal.dto';
import { updateGoalSchema, type UpdateGoalDto } from '../dto/update-goal.dto';
import { listGoalsQuerySchema, type ListGoalsQueryDto } from '../dto/list-goals-query.dto';
import { CreateGoalUseCase } from '../use-cases/create-goal.use-case';
import { UpdateGoalUseCase } from '../use-cases/update-goal.use-case';
import { DeleteGoalUseCase } from '../use-cases/delete-goal.use-case';
import { ListGoalsUseCase } from '../use-cases/list-goals.use-case';
import { GetRankingUseCase } from '../use-cases/get-ranking.use-case';
import type { Role } from '@nexus/types';

const SALES_ROLES: Role[] = ['sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director'];
const MANAGE_ROLES: Role[] = ['sales_supervisor', 'sales_manager', 'sales_director', 'admin'];
const DELETE_ROLES: Role[] = ['sales_director', 'admin'];

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(RolesGuard)
export class GoalsController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    private readonly deleteGoalUseCase: DeleteGoalUseCase,
    private readonly listGoalsUseCase: ListGoalsUseCase,
    private readonly getRankingUseCase: GetRankingUseCase,
  ) {}

  @Post()
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'goal.create', entity: 'goal' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createGoalSchema)) dto: CreateGoalDto,
  ) {
    const goal = await this.createGoalUseCase.execute(dto);
    return { data: goal.toPlainObject() };
  }

  @Get()
  @Roles(...SALES_ROLES, 'admin')
  async list(
    @Query(new ZodValidationPipe(listGoalsQuerySchema)) query: ListGoalsQueryDto,
    @CurrentUser() user: { id: string; user_metadata: { role: Role; team_id?: string; region_id?: string } },
  ) {
    const result = await this.listGoalsUseCase.execute({
      query,
      userId: user.id,
      userRole: user.user_metadata.role,
      userTeamId: user.user_metadata.team_id ?? null,
      userRegionId: user.user_metadata.region_id ?? null,
    });
    return {
      data: result.goals.map((g) => g.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('ranking')
  @Roles(...MANAGE_ROLES)
  async ranking(
    @Query('periodYear') periodYear?: string,
    @Query('periodMonth') periodMonth?: string,
    @Query('teamId') teamId?: string,
    @Query('regionId') regionId?: string,
  ) {
    const now = new Date();
    const entries = await this.getRankingUseCase.execute({
      periodYear: periodYear ? parseInt(periodYear, 10) : now.getFullYear(),
      periodMonth: periodMonth ? parseInt(periodMonth, 10) : now.getMonth() + 1,
      teamId,
      regionId,
    });
    return { data: entries };
  }

  @Patch(':id')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'goal.update', entity: 'goal' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) dto: UpdateGoalDto,
  ) {
    const goal = await this.updateGoalUseCase.execute(id, dto);
    return { data: goal.toPlainObject() };
  }

  @Delete(':id')
  @Roles(...DELETE_ROLES)
  @Auditable({ action: 'goal.delete', entity: 'goal' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteGoalUseCase.execute(id);
  }
}
