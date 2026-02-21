import { pgTable, uuid, text, numeric, date, timestamp, index } from 'drizzle-orm/pg-core';
import { financialTransactions } from './financial-transactions';
import { financialPendencies } from './financial-pendencies';

export const financialSettlements = pgTable('financial_settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => financialTransactions.id, { onDelete: 'restrict' }),
  pendencyId: uuid('pendency_id').notNull().references(() => financialPendencies.id, { onDelete: 'restrict' }),
  settledAmount: numeric('settled_amount', { precision: 18, scale: 4 }).notNull(),
  settlementDate: date('settlement_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  transactionIdx: index('idx_financial_settlements_transaction').on(table.transactionId),
  pendencyIdx: index('idx_financial_settlements_pendency').on(table.pendencyId),
  dateIdx: index('idx_financial_settlements_date').on(table.settlementDate),
}));
