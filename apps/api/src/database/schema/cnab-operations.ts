import { pgTable, uuid, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { cnabRemittanceFiles } from './cnab-remittance-files';

export const cnabOperations = pgTable('cnab_operations', {
  id: uuid('id').primaryKey().defaultRandom(),

  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  cnabFileId: uuid('cnab_file_id')
    .notNull()
    .unique()
    .references(() => cnabRemittanceFiles.id, { onDelete: 'cascade' }),

  status: text('status').notNull().default('draft'),
  totalSubmittedAmount: numeric('total_submitted_amount', { precision: 18, scale: 4 }).notNull().default('0'),
  totalApprovedAmount: numeric('total_approved_amount', { precision: 18, scale: 4 }).notNull().default('0'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_cnab_operations_client').on(table.clientId),
  statusIdx: index('idx_cnab_operations_status').on(table.status),
  cnabFileIdx: index('idx_cnab_operations_cnab_file').on(table.cnabFileId),
}));
