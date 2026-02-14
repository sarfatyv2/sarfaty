import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { regions } from './regions';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: text('role').notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  regionId: uuid('region_id').references(() => regions.id),
  isActive: boolean('is_active').default(true),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  roleIdx: index('idx_profiles_role').on(table.role),
  teamIdx: index('idx_profiles_team').on(table.teamId),
  regionIdx: index('idx_profiles_region').on(table.regionId),
}));
