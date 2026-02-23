import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { govCommittees } from './gov-committees';

export const govMeetings = pgTable('gov_meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  committeeId: uuid('committee_id').notNull().references(() => govCommittees.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  locationOrLink: text('location_or_link'),
  status: text('status').notNull().default('scheduled'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gov_meetings_committee').on(table.committeeId),
  index('idx_gov_meetings_status').on(table.status),
  index('idx_gov_meetings_scheduled').on(table.scheduledAt),
]);
