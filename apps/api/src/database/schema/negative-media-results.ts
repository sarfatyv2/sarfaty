import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const negativeMediaResults = pgTable('negative_media_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cnpj: text('cnpj'),
  companyName: text('company_name'),
  riskLevel: text('risk_level').notNull(), // 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR'
  findingsCount: integer('findings_count').notNull().default(0),
  findings: jsonb('findings'), // MediaFinding[]
  summary: text('summary'),
  groundingSources: jsonb('grounding_sources'), // Array<{ uri, title }>

  rawResponse: jsonb('raw_response'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_negative_media_results_client').on(table.clientId),
  cnpjIdx: index('idx_negative_media_results_cnpj').on(table.cnpj),
}));
