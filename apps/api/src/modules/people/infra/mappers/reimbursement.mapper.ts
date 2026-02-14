import type { Reimbursement } from '../../domain/reimbursement.entity';
import { Reimbursement as ReimbursementEntity } from '../../domain/reimbursement.entity';
import type { InferSelectModel } from 'drizzle-orm';
import { reimbursements } from '../../../../database/schema/reimbursements';

type ReimbursementRow = InferSelectModel<typeof reimbursements>;

export class ReimbursementMapper {
  static toDomain(row: ReimbursementRow): Reimbursement {
    return new ReimbursementEntity({
      id: row.id,
      collaboratorId: row.collaboratorId ?? '',
      title: row.title,
      description: row.description,
      category: row.category,
      amount: row.amount,
      expenseDate: row.expenseDate,
      receiptPath: row.receiptPath,
      receiptFileName: row.receiptFileName,
      receiptUploadedAt: row.receiptUploadedAt,
      receiptFileSize: row.receiptFileSize,
      receiptMimeType: row.receiptMimeType,
      status: row.status as ReimbursementEntity['status'],
      approvedBy: row.approvedBy,
      approvedAt: row.approvedAt,
      rejectionReason: row.rejectionReason,
      rejectedBy: row.rejectedBy,
      rejectedAt: row.rejectedAt,
      paidBy: row.paidBy,
      paidAt: row.paidAt,
      paymentReference: row.paymentReference,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
