import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { govActionItems } from './gov-action-items';

export const govActionUpdates = pgTable('gov_action_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  actionItemId: uuid('action_item_id').notNull().references(() => govActionItems.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id),
  comment: text('comment').notNull(),
  statusChange: text('status_change'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gov_action_updates_item').on(table.actionItemId),
  index('idx_gov_action_updates_author').on(table.authorId),
]);
