import { pgTable, uuid, text, numeric, date, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { financialAccounts } from './financial-accounts';
import { financialEventTypes } from './financial-event-types';

export const financialPendencies = pgTable('financial_pendencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  financialAccountId: uuid('financial_account_id').notNull().references(() => financialAccounts.id, { onDelete: 'restrict' }),
  eventTypeId: uuid('event_type_id').references(() => financialEventTypes.id),
  // drawee_id referenciado apenas no banco via FK adicionada na migration (evita import circular com drawees)
  draweeId: uuid('drawee_id'),
  originalAmount: numeric('original_amount', { precision: 18, scale: 4 }).notNull(),
  correctedAmount: numeric('corrected_amount', { precision: 18, scale: 4 }),
  settledAmount: numeric('settled_amount', { precision: 18, scale: 4 }),
  pendingDate: date('pending_date').notNull(),
  settlementDate: date('settlement_date'),
  isReversal: boolean('is_reversal').notNull().default(false),
  notes: text('notes'),
  legacyNfCode: integer('legacy_nf_code'),
  legacySgsCode: integer('legacy_sgs_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  accountIdx: index('idx_financial_pendencies_account').on(table.financialAccountId),
  draweeIdx: index('idx_financial_pendencies_drawee').on(table.draweeId),
  pendingDateIdx: index('idx_financial_pendencies_date').on(table.pendingDate),
  reversalIdx: index('idx_financial_pendencies_reversal').on(table.isReversal),
}));
