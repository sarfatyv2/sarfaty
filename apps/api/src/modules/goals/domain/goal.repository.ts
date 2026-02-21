import type { PaginationMeta } from '@nexus/types';
import type { Goal } from './goal.entity';

export const GOAL_REPOSITORY = Symbol('GOAL_REPOSITORY');

export interface GoalFilters {
  level?: 'individual' | 'team' | 'region';
  periodYear?: number;
  periodMonth?: number;
  profileId?: string;
  teamId?: string;
  regionId?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedGoals {
  goals: Goal[];
  pagination: PaginationMeta;
}

export interface RankingRow {
  profileId: string;
  fullName: string;
  teamName: string | null;
  achievedAmount: string;
  achievedCount: number;
  goalAmount: string;
}

export interface GoalRepository {
  save(goal: Goal): Promise<Goal>;
  findById(id: string): Promise<Goal | null>;
  findByFilters(filters: GoalFilters): Promise<PaginatedGoals>;
  findExisting(
    profileId: string | null,
    teamId: string | null,
    regionId: string | null,
    periodYear: number,
    periodMonth: number,
  ): Promise<Goal | null>;
  update(id: string, data: Partial<{ goalAmount: string; goalCount: number | null }>): Promise<Goal | null>;
  delete(id: string): Promise<boolean>;
  getRanking(periodYear: number, periodMonth: number, teamId?: string, regionId?: string): Promise<RankingRow[]>;
}
