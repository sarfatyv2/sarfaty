import { pgTable, uuid, integer, numeric, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { teams } from './teams';
import { regions } from './regions';

export const salesGoals = pgTable('sales_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  regionId: uuid('region_id').references(() => regions.id),
  periodYear: integer('period_year').notNull(),
  periodMonth: integer('period_month').notNull(),
  goalAmount: numeric('goal_amount', { precision: 15, scale: 2 }).notNull(),
  goalCount: integer('goal_count'),
  achievedAmount: numeric('achieved_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  achievedCount: integer('achieved_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  periodIdx: index('idx_goals_period').on(table.periodYear, table.periodMonth),
  goalTargetCheck: check(
    'goal_target_check',
    sql`(${table.profileId} IS NOT NULL)::int + (${table.teamId} IS NOT NULL)::int + (${table.regionId} IS NOT NULL)::int = 1`,
  ),
}));
