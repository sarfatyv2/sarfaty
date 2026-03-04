import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const cguCheckResults = pgTable('cgu_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cnpj: text('cnpj'),
  checkType: text('check_type').notNull(), // 'CEIS' | 'CNEP' | 'CEPIM'
  hasMatch: boolean('has_match').notNull().default(false),
  matchCount: integer('match_count').notNull().default(0),
  summary: text('summary'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_cgu_check_results_client').on(table.clientId),
  cnpjIdx: index('idx_cgu_check_results_cnpj').on(table.cnpj),
  typeIdx: index('idx_cgu_check_results_type').on(table.checkType),
}));
