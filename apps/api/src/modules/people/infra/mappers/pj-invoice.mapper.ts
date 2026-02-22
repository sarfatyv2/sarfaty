import type { PjInvoice } from '../../domain/pj-invoice.entity';
import { PjInvoice as PjInvoiceEntity } from '../../domain/pj-invoice.entity';
import type { InferSelectModel } from 'drizzle-orm';
import { type pjInvoices } from '../../../../database/schema/pj-invoices';

type PjInvoiceRow = InferSelectModel<typeof pjInvoices>;

export class PjInvoiceMapper {
  static toDomain(row: PjInvoiceRow): PjInvoice {
    return new PjInvoiceEntity({
      id: row.id,
      collaboratorId: row.collaboratorId ?? '',
      referenceMonth: row.referenceMonth,
      referenceYear: row.referenceYear,
      invoiceNumber: row.invoiceNumber,
      invoiceAmount: row.invoiceAmount,
      invoicePath: row.invoicePath,
      invoiceFileName: row.invoiceFileName,
      uploadedAt: row.uploadedAt,
      uploadedBy: row.uploadedBy,
      invoiceFileSize: row.invoiceFileSize,
      invoiceMimeType: row.invoiceMimeType,
      status: row.status as PjInvoiceEntity['status'],
      approvedByFinance1: row.approvedByFinance1,
      approvedAtFinance1: row.approvedAtFinance1,
      approvedByFinance2: row.approvedByFinance2,
      approvedAtFinance2: row.approvedAtFinance2,
      paidAt: row.paidAt,
      paymentReference: row.paymentReference,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      rejectionReason: row.rejectionReason,
      reminderSentAt: row.reminderSentAt,
      reminderCount: row.reminderCount ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
