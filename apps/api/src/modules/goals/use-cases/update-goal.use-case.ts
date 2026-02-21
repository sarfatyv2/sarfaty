import { Inject, Injectable } from '@nestjs/common';
import type { UpdateGoalDto } from '@nexus/validators';
import type { Goal } from '../domain/goal.entity';
import { GOAL_REPOSITORY, type GoalRepository } from '../domain/goal.repository';
import { GoalNotFoundException } from '../domain/exceptions/goal-not-found.exception';

@Injectable()
export class UpdateGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: string, dto: UpdateGoalDto): Promise<Goal> {
    const existing = await this.goalRepository.findById(id);
    if (!existing) {
      throw new GoalNotFoundException(id);
    }

    const updateData: Partial<{ goalAmount: string; goalCount: number | null }> = {};
    if (dto.goalAmount !== undefined) {
      updateData.goalAmount = dto.goalAmount.toString();
    }
    if (dto.goalCount !== undefined) {
      updateData.goalCount = dto.goalCount;
    }

    const updated = await this.goalRepository.update(id, updateData);
    if (!updated) {
      throw new GoalNotFoundException(id);
    }

    return updated;
  }
}
