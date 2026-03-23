import { pgTable, uuid, text, integer, numeric, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';
import { profiles } from './profiles';
import { billingCompanies } from './billing-companies';

export const pjInvoices = pgTable('pj_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id),
  billingCompanyId: uuid('billing_company_id').references(() => billingCompanies.id),
  referenceMonth: integer('reference_month').notNull(),
  referenceYear: integer('reference_year').notNull(),
  invoiceNumber: text('invoice_number'),
  invoiceAmount: numeric('invoice_amount', { precision: 15, scale: 2 }).notNull(),
  invoicePath: text('invoice_path'),
  invoiceFileName: text('invoice_file_name'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
  uploadedBy: uuid('uploaded_by').references(() => profiles.id),
  invoiceFileSize: integer('invoice_file_size'),
  invoiceMimeType: text('invoice_mime_type'),
  status: text('status').notNull().default('pending'),
  approvedByFinance1: uuid('approved_by_finance_1').references(() => profiles.id),
  approvedAtFinance1: timestamp('approved_at_finance_1', { withTimezone: true }),
  approvedByFinance2: uuid('approved_by_finance_2').references(() => profiles.id),
  approvedAtFinance2: timestamp('approved_at_finance_2', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  paymentReference: text('payment_reference'),
  reviewedBy: uuid('reviewed_by').references(() => profiles.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  reminderCount: integer('reminder_count').default(0),
  emailNotifiedAt: timestamp('email_notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorMonthYearUniq: unique('uq_pj_invoices_collab_month_year').on(table.collaboratorId, table.referenceMonth, table.referenceYear),
  collaboratorIdx: index('idx_pj_invoices_collaborator').on(table.collaboratorId),
  statusIdx: index('idx_pj_invoices_status').on(table.status),
  referenceIdx: index('idx_pj_invoices_reference').on(table.referenceYear, table.referenceMonth),
  statusPeriodIdx: index('idx_pj_inv_status_period').on(table.status, table.referenceYear, table.referenceMonth),
  billingCompanyIdx: index('idx_pj_invoices_billing_company').on(table.billingCompanyId),
}));
