import { pgTable, uuid, text, integer, numeric, date, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';
import { profiles } from './profiles';

export const reimbursements = pgTable('reimbursements', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  expenseDate: date('expense_date').notNull(),
  receiptPath: text('receipt_path'),
  receiptFileName: text('receipt_file_name'),
  receiptUploadedAt: timestamp('receipt_uploaded_at', { withTimezone: true }),
  receiptFileSize: integer('receipt_file_size'),
  receiptMimeType: text('receipt_mime_type'),
  status: text('status').notNull().default('pending'),
  approvedBy: uuid('approved_by').references(() => profiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  rejectedBy: uuid('rejected_by').references(() => profiles.id),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  paidBy: uuid('paid_by').references(() => profiles.id),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  paymentReference: text('payment_reference'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_reimbursements_collaborator').on(table.collaboratorId),
  statusIdx: index('idx_reimbursements_status').on(table.status),
  approvedByIdx: index('idx_reimbursements_approved_by').on(table.approvedBy),
}));
