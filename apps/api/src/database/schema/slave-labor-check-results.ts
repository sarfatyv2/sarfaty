import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const slaveLaborCheckResults = pgTable('slave_labor_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cnpj: text('cnpj'),
  hasMatch: boolean('has_match').notNull().default(false),
  employerName: text('employer_name'),
  rescuedWorkers: integer('rescued_workers'),
  inspectionDate: timestamp('inspection_date', { withTimezone: true }),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_slave_labor_check_results_client').on(table.clientId),
  cnpjIdx: index('idx_slave_labor_check_results_cnpj').on(table.cnpj),
}));
