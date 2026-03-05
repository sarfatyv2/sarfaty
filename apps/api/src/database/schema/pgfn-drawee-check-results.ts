import { pgTable, uuid, text, boolean, integer, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const pgfnDraweeCheckResults = pgTable('pgfn_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  hasDebt: boolean('has_debt').notNull().default(false),
  totalDebtAmount: numeric('total_debt_amount', { precision: 15, scale: 2 }),
  debtCount: integer('debt_count').notNull().default(0),
  summary: text('summary'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_pgfn_drawee_check_drawee').on(table.draweeId),
  cnpjIdx: index('idx_pgfn_drawee_check_cnpj').on(table.cnpj),
}));
