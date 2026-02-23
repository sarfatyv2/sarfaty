import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { govMeetings } from './gov-meetings';

export const govMeetingMinutes = pgTable('gov_meeting_minutes', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id').notNull().unique().references(() => govMeetings.id, { onDelete: 'cascade' }),
  content: jsonb('content'),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishedBy: uuid('published_by').references(() => profiles.id),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gov_minutes_meeting').on(table.meetingId),
  index('idx_gov_minutes_status').on(table.status),
]);
