export const GOAL_LEVELS = ['individual', 'team', 'region'] as const;

export type GoalLevel = (typeof GOAL_LEVELS)[number];

export interface SalesGoal {
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
  createdAt: string;
  updatedAt: string;
}

export interface GoalWithDetails extends SalesGoal {
  level: GoalLevel;
  targetName: string;
}

export interface RankingEntry {
  position: number;
  profileId: string;
  name: string;
  teamName: string | null;
  achievedAmount: string;
  achievedCount: number;
  goalAmount: string;
  progressPct: number;
}
