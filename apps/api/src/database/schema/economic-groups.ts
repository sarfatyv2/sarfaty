import { pgTable, uuid, text, date, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const economicGroups = pgTable('economic_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type'),  // 'client_group' | 'drawee_group' | 'sarfaty_group'
  activeSince: date('active_since'),
  inactiveSince: date('inactive_since'),
  status: text('status').notNull().default('active'),
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  statusIdx: index('idx_economic_groups_status').on(table.status),
  typeIdx: index('idx_economic_groups_type').on(table.type),
}));
