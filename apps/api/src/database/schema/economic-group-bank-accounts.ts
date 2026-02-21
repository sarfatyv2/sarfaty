import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { economicGroups } from './economic-groups';

export const economicGroupBankAccounts = pgTable('economic_group_bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  economicGroupId: uuid('economic_group_id').notNull().references(() => economicGroups.id, { onDelete: 'cascade' }),
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
  groupIdx: index('idx_eg_bank_accounts_group').on(table.economicGroupId),
  statusIdx: index('idx_eg_bank_accounts_status').on(table.status),
}));
