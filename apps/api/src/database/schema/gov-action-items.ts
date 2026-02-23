import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { govCommittees } from './gov-committees';
import { govMeetingMinutes } from './gov-meeting-minutes';

export const govActionItems = pgTable('gov_action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  committeeId: uuid('committee_id').notNull().references(() => govCommittees.id),
  minuteId: uuid('minute_id').references(() => govMeetingMinutes.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  assigneeId: uuid('assignee_id').references(() => profiles.id),
  groupLabel: text('group_label'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: text('status').notNull().default('todo'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gov_actions_committee').on(table.committeeId),
  index('idx_gov_actions_assignee').on(table.assigneeId),
  index('idx_gov_actions_status').on(table.status),
  index('idx_gov_actions_due_date').on(table.dueDate),
]);
