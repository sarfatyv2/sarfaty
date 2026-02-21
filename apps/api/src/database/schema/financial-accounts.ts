import { pgTable, uuid, text, numeric, date, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const financialAccounts = pgTable('financial_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'restrict' }),
  accountType: text('account_type').notNull(),  // 'graphic' | 'real'
  bankCode: text('bank_code'),
  branch: text('branch'),
  accountNumber: text('account_number'),
  status: text('status').notNull().default('active'),  // 'active' | 'closed' | 'blocked'
  blockType: text('block_type'),
  blockReason: text('block_reason'),
  fees: numeric('fees', { precision: 18, scale: 4 }),
  openedAt: date('opened_at'),
  closedAt: date('closed_at'),
  legacyNfId: integer('legacy_nf_id'),
  legacySgsId: integer('legacy_sgs_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_financial_accounts_client').on(table.clientId),
  statusIdx: index('idx_financial_accounts_status').on(table.status),
  typeIdx: index('idx_financial_accounts_type').on(table.accountType),
}));
