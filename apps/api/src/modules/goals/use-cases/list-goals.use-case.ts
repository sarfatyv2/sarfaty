import { Inject, Injectable } from '@nestjs/common';
import type { ListGoalsQueryDto } from '@nexus/validators';
import type { Role } from '@nexus/types';
import { GOAL_REPOSITORY, type GoalRepository, type GoalFilters, type PaginatedGoals } from '../domain/goal.repository';

interface ListGoalsInput {
  query: ListGoalsQueryDto;
  userId: string;
  userRole: Role;
  userTeamId: string | null;
  userRegionId: string | null;
}

@Injectable()
export class ListGoalsUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(input: ListGoalsInput): Promise<PaginatedGoals> {
    const now = new Date();
    const filters: GoalFilters = {
      level: input.query.level,
      periodYear: input.query.periodYear ?? now.getFullYear(),
      periodMonth: input.query.periodMonth ?? now.getMonth() + 1,
      page: input.query.page,
      pageSize: input.query.pageSize,
      sortOrder: input.query.sortOrder,
    };

    switch (input.userRole) {
      case 'admin':
      case 'sales_director':
        if (input.query.teamId) filters.teamId = input.query.teamId;
        if (input.query.regionId) filters.regionId = input.query.regionId;
        break;

      case 'sales_manager':
        filters.regionId = input.query.regionId ?? input.userRegionId ?? undefined;
        break;

      case 'sales_supervisor':
        filters.teamId = input.query.teamId ?? input.userTeamId ?? undefined;
        break;

      default:
        filters.profileId = input.userId;
        break;
    }

    return this.goalRepository.findByFilters(filters);
  }
}
