import { Inject, Injectable } from '@nestjs/common';
import type { CreateGoalDto } from '@nexus/validators';
import { Goal } from '../domain/goal.entity';
import { GOAL_REPOSITORY, type GoalRepository } from '../domain/goal.repository';
import { GoalAlreadyExistsException } from '../domain/exceptions/goal-already-exists.exception';

@Injectable()
export class CreateGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(dto: CreateGoalDto): Promise<Goal> {
    const profileId = dto.level === 'individual' ? (dto.profileId ?? null) : null;
    const teamId = dto.level === 'team' ? (dto.teamId ?? null) : null;
    const regionId = dto.level === 'region' ? (dto.regionId ?? null) : null;

    const existing = await this.goalRepository.findExisting(
      profileId,
      teamId,
      regionId,
      dto.periodYear,
      dto.periodMonth,
    );

    if (existing) {
      throw new GoalAlreadyExistsException(dto.periodYear, dto.periodMonth);
    }

    const goal = Goal.create({
      profileId,
      teamId,
      regionId,
      periodYear: dto.periodYear,
      periodMonth: dto.periodMonth,
      goalAmount: dto.goalAmount.toString(),
      goalCount: dto.goalCount ?? null,
    });

    return this.goalRepository.save(goal);
  }
}
