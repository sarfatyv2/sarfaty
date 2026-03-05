import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const slaveLaborDraweeCheckResults = pgTable('slave_labor_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  hasMatch: boolean('has_match').notNull().default(false),
  employerName: text('employer_name'),
  rescuedWorkers: integer('rescued_workers'),
  inspectionDate: timestamp('inspection_date', { withTimezone: true }),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_slave_labor_drawee_check_drawee').on(table.draweeId),
  cnpjIdx: index('idx_slave_labor_drawee_check_cnpj').on(table.cnpj),
}));
