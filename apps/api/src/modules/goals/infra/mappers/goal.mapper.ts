import { Goal } from '../../domain/goal.entity';

export class GoalMapper {
  static toDomain(row: {
    id: string;
    profileId: string | null;
    teamId: string | null;
    regionId: string | null;
    periodYear: number;
    periodMonth: number;
    goalAmount: string;
    goalCount: number | null;
    achievedAmount: string;
    achievedCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): Goal {
    return Goal.reconstitute({
      id: row.id,
      profileId: row.profileId,
      teamId: row.teamId,
      regionId: row.regionId,
      periodYear: row.periodYear,
      periodMonth: row.periodMonth,
      goalAmount: row.goalAmount,
      goalCount: row.goalCount,
      achievedAmount: row.achievedAmount,
      achievedCount: row.achievedCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
