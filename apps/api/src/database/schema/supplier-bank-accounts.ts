import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';

export const supplierBankAccounts = pgTable('supplier_bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  bankCode: text('bank_code'),
  bankName: text('bank_name'),
  branch: text('branch'),
  accountNumber: text('account_number'),
  accountType: text('account_type'),  // 'checking' | 'savings' | 'payment'
  pixKey: text('pix_key'),
  nickname: text('nickname'),
  openedAt: date('opened_at'),
  closedAt: date('closed_at'),
  status: text('status').notNull().default('active'),  // 'active' | 'closed' | 'blocked'
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  supplierIdx: index('idx_supplier_bank_accounts_supplier').on(table.supplierId),
  primaryIdx: index('idx_supplier_bank_accounts_primary').on(table.supplierId, table.isPrimary),
  statusIdx: index('idx_supplier_bank_accounts_status').on(table.status),
}));
