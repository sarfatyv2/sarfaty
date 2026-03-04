import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const cndtCheckResults = pgTable('cndt_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cnpj: text('cnpj'),
  certificateStatus: text('certificate_status').notNull(), // 'NEGATIVE' | 'POSITIVE' | 'POSITIVE_WITH_EFFECTS' | 'UNAVAILABLE' | 'UNKNOWN'
  certificateNumber: text('certificate_number'),
  validUntil: timestamp('valid_until', { withTimezone: true }),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_cndt_check_results_client').on(table.clientId),
  cnpjIdx: index('idx_cndt_check_results_cnpj').on(table.cnpj),
}));
