import { pgTable, uuid, text, numeric, integer, date, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const cnabRemittanceFiles = pgTable('cnab_remittance_files', {
  id: uuid('id').primaryKey().defaultRandom(),

  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),

  fileType: text('file_type').notNull().default('remittance'),
  layoutVersion: text('layout_version').notNull().default('cnab400'),
  bankCode: text('bank_code').notNull(),
  bankName: text('bank_name'),
  serviceCode: text('service_code'),
  cedentCode: text('cedent_code'),
  cedentName: text('cedent_name'),
  remittanceDate: date('remittance_date'),
  sequentialNumber: integer('sequential_number'),

  storagePath: text('storage_path').notNull(),
  originalFilename: text('original_filename').notNull(),

  totalRecords: integer('total_records'),
  totalAmount: numeric('total_amount', { precision: 18, scale: 4 }),

  status: text('status').notNull().default('uploaded'),
  parsingErrors: jsonb('parsing_errors'),
  processedAt: timestamp('processed_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientRemittanceDateIdx: index('idx_cnab_files_client_date').on(table.clientId, table.remittanceDate),
  statusIdx: index('idx_cnab_files_status').on(table.status),
}));
