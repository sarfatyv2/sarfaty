import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const draweeBankAccounts = pgTable('drawee_bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
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
  draweeIdx: index('idx_drawee_bank_accounts_drawee').on(table.draweeId),
  primaryIdx: index('idx_drawee_bank_accounts_primary').on(table.draweeId, table.isPrimary),
  statusIdx: index('idx_drawee_bank_accounts_status').on(table.status),
}));
