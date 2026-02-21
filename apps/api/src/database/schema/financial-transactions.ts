import { pgTable, uuid, text, numeric, date, integer, char, timestamp, index } from 'drizzle-orm/pg-core';
import { financialAccounts } from './financial-accounts';
import { financialEventTypes } from './financial-event-types';

export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  financialAccountId: uuid('financial_account_id').notNull().references(() => financialAccounts.id, { onDelete: 'restrict' }),
  eventTypeId: uuid('event_type_id').references(() => financialEventTypes.id),
  amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
  entryType: char('entry_type', { length: 1 }).notNull(),  // 'D' | 'C'
  description: text('description'),
  transactionDate: date('transaction_date').notNull(),
  referenceNfCode: integer('reference_nf_code'),
  referenceSgsCode: integer('reference_sgs_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  accountIdx: index('idx_financial_transactions_account').on(table.financialAccountId),
  dateIdx: index('idx_financial_transactions_date').on(table.transactionDate),
  entryTypeIdx: index('idx_financial_transactions_entry').on(table.entryType),
}));
