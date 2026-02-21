import { Module } from '@nestjs/common';
import { GoalsController } from './controllers/goals.controller';
import { CreateGoalUseCase } from './use-cases/create-goal.use-case';
import { UpdateGoalUseCase } from './use-cases/update-goal.use-case';
import { DeleteGoalUseCase } from './use-cases/delete-goal.use-case';
import { ListGoalsUseCase } from './use-cases/list-goals.use-case';
import { GetRankingUseCase } from './use-cases/get-ranking.use-case';
import { DrizzleGoalRepository } from './infra/drizzle-goal.repository';
import { GOAL_REPOSITORY } from './domain/goal.repository';

@Module({
  controllers: [GoalsController],
  providers: [
    CreateGoalUseCase,
    UpdateGoalUseCase,
    DeleteGoalUseCase,
    ListGoalsUseCase,
    GetRankingUseCase,
    { provide: GOAL_REPOSITORY, useClass: DrizzleGoalRepository },
  ],
})
export class GoalsModule {}
