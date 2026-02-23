import { pgTable, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { govCommittees } from './gov-committees';

export const govCommitteeMembers = pgTable('gov_committee_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  committeeId: uuid('committee_id').notNull().references(() => govCommittees.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id),
  role: text('role').notNull().default('member'),
  invitedBy: uuid('invited_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('gov_committee_members_unique').on(table.committeeId, table.profileId),
  index('idx_gov_members_committee').on(table.committeeId),
  index('idx_gov_members_profile').on(table.profileId),
]);
