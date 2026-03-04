import { pgTable, uuid, text, boolean, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const sanctionsCheckResults = pgTable('sanctions_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  entityName: text('entity_name'),
  documentSearched: text('document_searched'),
  source: text('source').notNull(), // 'OFAC' | 'UN' | 'EU' | 'OPENSANCTIONS'
  hasMatch: boolean('has_match').notNull().default(false),
  matchScore: numeric('match_score', { precision: 5, scale: 4 }),
  matchDetails: text('match_details'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_sanctions_check_results_client').on(table.clientId),
  sourceIdx: index('idx_sanctions_check_results_source').on(table.source),
}));
