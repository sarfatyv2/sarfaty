import { pgTable, uuid, text, boolean, integer, char, timestamp, index } from 'drizzle-orm/pg-core';

export const financialEventTypes = pgTable('financial_event_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  legacyNfCode: integer('legacy_nf_code'),
  legacySgsCode: integer('legacy_sgs_code'),
  name: text('name').notNull(),
  entryType: char('entry_type', { length: 1 }).notNull(),  // 'D' | 'C'
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  activeIdx: index('idx_financial_event_types_active').on(table.isActive),
  entryTypeIdx: index('idx_financial_event_types_entry').on(table.entryType),
}));
