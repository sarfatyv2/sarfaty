import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const serasaDraweeReportResults = pgTable('serasa_drawee_report_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  cnpj: text('cnpj').notNull(),
  reportName: text('report_name').notNull(),
  optionalFeatures: jsonb('optional_features').$type<string[]>(),
  statusCode: integer('status_code').notNull(),
  rawResponse: jsonb('raw_response'),
  errorMessage: text('error_message'),
  requestId: text('request_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_serasa_drawee_report_drawee').on(table.draweeId),
  cnpjReportIdx: index('idx_serasa_drawee_report_cnpj').on(table.cnpj, table.reportName, table.createdAt),
}));
