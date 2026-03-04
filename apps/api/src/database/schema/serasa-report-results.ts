import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const serasaReportResults = pgTable('serasa_report_pj_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  cnpj: text('cnpj').notNull(),
  reportName: text('report_name').notNull(),
  optionalFeatures: jsonb('optional_features').$type<string[]>(),
  statusCode: integer('status_code').notNull(),
  rawResponse: jsonb('raw_response'),
  errorMessage: text('error_message'),
  requestId: text('request_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_serasa_report_client').on(table.clientId),
  cnpjReportIdx: index('idx_serasa_report_cnpj_report').on(table.cnpj, table.reportName, table.createdAt),
}));
