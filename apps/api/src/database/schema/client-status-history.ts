import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { profiles } from './profiles';

export const clientStatusHistory = pgTable('client_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  changedBy: uuid('changed_by').references(() => profiles.id),
  changeReason: text('change_reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_status_history_client').on(table.clientId),
  createdIdx: index('idx_status_history_created').on(table.createdAt),
}));
