import { Inject, Injectable } from '@nestjs/common';
import type { RankingEntry } from '@nexus/types';
import { GOAL_REPOSITORY, type GoalRepository } from '../domain/goal.repository';

interface GetRankingInput {
  periodYear: number;
  periodMonth: number;
  teamId?: string;
  regionId?: string;
}

@Injectable()
export class GetRankingUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(input: GetRankingInput): Promise<RankingEntry[]> {
    const rows = await this.goalRepository.getRanking(
      input.periodYear,
      input.periodMonth,
      input.teamId,
      input.regionId,
    );

    return rows.map((row, index) => {
      const achieved = parseFloat(row.achievedAmount);
      const target = parseFloat(row.goalAmount);
      const progressPct = target > 0 ? Math.min(Math.round((achieved / target) * 100), 100) : 0;

      return {
        position: index + 1,
        profileId: row.profileId,
        name: row.fullName,
        teamName: row.teamName,
        achievedAmount: row.achievedAmount,
        achievedCount: row.achievedCount,
        goalAmount: row.goalAmount,
        progressPct,
      };
    });
  }
}
