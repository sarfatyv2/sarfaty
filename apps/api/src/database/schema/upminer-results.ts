import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const upminerResults = pgTable('upminer_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  document: text('document').notNull(),
  inputType: integer('input_type').notNull(),
  searchProfileId: integer('search_profile_id').notNull(),
  batchId: integer('batch_id'),
  status: text('status').notNull().default('PENDING'),
  dossiersData: jsonb('dossiers_data'),
  errorMessage: text('error_message'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (table) => ({
  clientIdx: index('idx_upminer_results_client').on(table.clientId),
  batchIdx: index('idx_upminer_results_batch').on(table.batchId),
  statusIdx: index('idx_upminer_results_status').on(table.status),
}));
