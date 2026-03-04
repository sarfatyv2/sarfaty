import { pgTable, uuid, text, boolean, integer, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const pgfnCheckResults = pgTable('pgfn_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cnpj: text('cnpj'),
  hasDebt: boolean('has_debt').notNull().default(false),
  totalDebtAmount: numeric('total_debt_amount', { precision: 15, scale: 2 }),
  debtCount: integer('debt_count').notNull().default(0),
  summary: text('summary'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_pgfn_check_results_client').on(table.clientId),
  cnpjIdx: index('idx_pgfn_check_results_cnpj').on(table.cnpj),
}));
