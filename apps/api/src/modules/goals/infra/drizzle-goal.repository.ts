import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql, desc, isNotNull, count as drizzleCount } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { salesGoals } from '../../../database/schema/sales-goals';
import { profiles } from '../../../database/schema/profiles';
import { teams } from '../../../database/schema/teams';

import type { GoalRepository, GoalFilters, PaginatedGoals, RankingRow } from '../domain/goal.repository';
import { Goal } from '../domain/goal.entity';
import { GoalMapper } from './mappers/goal.mapper';

@Injectable()
export class DrizzleGoalRepository implements GoalRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(goal: Goal): Promise<Goal> {
    const [row] = await this.db
      .insert(salesGoals)
      .values({
        profileId: goal.profileId,
        teamId: goal.teamId,
        regionId: goal.regionId,
        periodYear: goal.periodYear,
        periodMonth: goal.periodMonth,
        goalAmount: goal.goalAmount,
        goalCount: goal.goalCount,
      })
      .returning();

    return GoalMapper.toDomain(row!);
  }

  async findById(id: string): Promise<Goal | null> {
    const [row] = await this.db
      .select()
      .from(salesGoals)
      .where(eq(salesGoals.id, id))
      .limit(1);

    return row ? GoalMapper.toDomain(row) : null;
  }

  async findExisting(
    profileId: string | null,
    teamId: string | null,
    regionId: string | null,
    periodYear: number,
    periodMonth: number,
  ): Promise<Goal | null> {
    const conditions = [
      eq(salesGoals.periodYear, periodYear),
      eq(salesGoals.periodMonth, periodMonth),
    ];

    if (profileId) conditions.push(eq(salesGoals.profileId, profileId));
    if (teamId) conditions.push(eq(salesGoals.teamId, teamId));
    if (regionId) conditions.push(eq(salesGoals.regionId, regionId));

    const [row] = await this.db
      .select()
      .from(salesGoals)
      .where(and(...conditions))
      .limit(1);

    return row ? GoalMapper.toDomain(row) : null;
  }

  async findByFilters(filters: GoalFilters): Promise<PaginatedGoals> {
    const conditions = [];

    if (filters.periodYear) {
      conditions.push(eq(salesGoals.periodYear, filters.periodYear));
    }
    if (filters.periodMonth) {
      conditions.push(eq(salesGoals.periodMonth, filters.periodMonth));
    }
    if (filters.profileId) {
      conditions.push(eq(salesGoals.profileId, filters.profileId));
    }
    if (filters.teamId) {
      conditions.push(eq(salesGoals.teamId, filters.teamId));
    }
    if (filters.regionId) {
      conditions.push(eq(salesGoals.regionId, filters.regionId));
    }
    if (filters.level === 'individual') {
      conditions.push(isNotNull(salesGoals.profileId));
    } else if (filters.level === 'team') {
      conditions.push(isNotNull(salesGoals.teamId));
    } else if (filters.level === 'region') {
      conditions.push(isNotNull(salesGoals.regionId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ total: drizzleCount() })
      .from(salesGoals)
      .where(whereClause);

    const total = totalResult?.total ?? 0;
    const offset = (filters.page - 1) * filters.pageSize;

    const rows = await this.db
      .select()
      .from(salesGoals)
      .where(whereClause)
      .orderBy(
        filters.sortOrder === 'asc'
          ? salesGoals.periodYear
          : desc(salesGoals.periodYear),
      )
      .limit(filters.pageSize)
      .offset(offset);

    return {
      goals: rows.map(GoalMapper.toDomain),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(
    id: string,
    data: Partial<{ goalAmount: string; goalCount: number | null }>,
  ): Promise<Goal | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.goalAmount !== undefined) updateData.goalAmount = data.goalAmount;
    if (data.goalCount !== undefined) updateData.goalCount = data.goalCount;

    const [row] = await this.db
      .update(salesGoals)
      .set(updateData)
      .where(eq(salesGoals.id, id))
      .returning();

    return row ? GoalMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(salesGoals)
      .where(eq(salesGoals.id, id))
      .returning({ id: salesGoals.id });

    return result.length > 0;
  }

  async getRanking(
    periodYear: number,
    periodMonth: number,
    teamId?: string,
    _regionId?: string,
  ): Promise<RankingRow[]> {
    const conditions = [
      eq(salesGoals.periodYear, periodYear),
      eq(salesGoals.periodMonth, periodMonth),
      isNotNull(salesGoals.profileId),
    ];

    if (teamId) {
      conditions.push(eq(salesGoals.teamId, sql`(SELECT team_id FROM profiles WHERE id = ${salesGoals.profileId})`));
    }

    const rows = await this.db
      .select({
        profileId: salesGoals.profileId,
        fullName: profiles.fullName,
        teamName: teams.name,
        achievedAmount: salesGoals.achievedAmount,
        achievedCount: salesGoals.achievedCount,
        goalAmount: salesGoals.goalAmount,
      })
      .from(salesGoals)
      .innerJoin(profiles, eq(salesGoals.profileId, profiles.id))
      .leftJoin(teams, eq(profiles.teamId, teams.id))
      .where(and(...conditions))
      .orderBy(desc(salesGoals.achievedAmount));

    return rows.map((r) => ({
      profileId: r.profileId!,
      fullName: r.fullName ?? '',
      teamName: r.teamName,
      achievedAmount: r.achievedAmount,
      achievedCount: r.achievedCount,
      goalAmount: r.goalAmount,
    }));
  }
}
