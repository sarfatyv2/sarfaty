import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const govCommittees = pgTable('gov_committees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  regulation: text('regulation'),
  frequency: text('frequency').notNull().default('monthly'),
  status: text('status').notNull().default('active'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gov_committees_status').on(table.status),
  index('idx_gov_committees_created_by').on(table.createdBy),
]);
