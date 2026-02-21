import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const creditboxReports = pgTable('creditbox_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  processId: text('process_id'),
  status: text('status').notNull(), // 'PENDING', 'PROCESSING', 'COMPLETED', 'ERROR'
  reportJson: jsonb('report_json'),
  pdfBase64: text('pdf_base64'),
  errorMessage: text('error_message'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => ({
  clientIdx: index('idx_creditbox_reports_client').on(table.clientId),
  processIdx: index('idx_creditbox_reports_process').on(table.processId),
}));
