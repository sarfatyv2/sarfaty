import { Inject, Injectable } from '@nestjs/common';
import { GOAL_REPOSITORY, type GoalRepository } from '../domain/goal.repository';
import { GoalNotFoundException } from '../domain/exceptions/goal-not-found.exception';

@Injectable()
export class DeleteGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.goalRepository.findById(id);
    if (!existing) {
      throw new GoalNotFoundException(id);
    }

    const deleted = await this.goalRepository.delete(id);
    if (!deleted) {
      throw new GoalNotFoundException(id);
    }
  }
}
