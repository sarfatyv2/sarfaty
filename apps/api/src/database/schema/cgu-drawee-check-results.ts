import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const cguDraweeCheckResults = pgTable('cgu_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  checkType: text('check_type').notNull(),
  hasMatch: boolean('has_match').notNull().default(false),
  matchCount: integer('match_count').notNull().default(0),
  summary: text('summary'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_cgu_drawee_check_drawee').on(table.draweeId),
  cnpjIdx: index('idx_cgu_drawee_check_cnpj').on(table.cnpj),
  typeIdx: index('idx_cgu_drawee_check_type').on(table.checkType),
}));
