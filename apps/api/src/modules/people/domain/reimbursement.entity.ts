import type { ReimbursementStatus } from '@nexus/utils';

export interface ReimbursementProps {
  id: string;
  collaboratorId: string;
  title: string;
  description: string | null;
  category: string;
  amount: string;
  expenseDate: string;
  receiptPath: string | null;
  receiptFileName: string | null;
  receiptUploadedAt: Date | null;
  receiptFileSize: number | null;
  receiptMimeType: string | null;
  status: ReimbursementStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  paidBy: string | null;
  paidAt: Date | null;
  paymentReference: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Reimbursement {
  readonly id: string;
  readonly collaboratorId: string;
  readonly title: string;
  readonly description: string | null;
  readonly category: string;
  readonly amount: string;
  readonly expenseDate: string;
  readonly receiptPath: string | null;
  readonly receiptFileName: string | null;
  readonly receiptUploadedAt: Date | null;
  readonly receiptFileSize: number | null;
  readonly receiptMimeType: string | null;
  readonly status: ReimbursementStatus;
  readonly approvedBy: string | null;
  readonly approvedAt: Date | null;
  readonly rejectionReason: string | null;
  readonly rejectedBy: string | null;
  readonly rejectedAt: Date | null;
  readonly paidBy: string | null;
  readonly paidAt: Date | null;
  readonly paymentReference: string | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(props: ReimbursementProps) {
    this.id = props.id;
    this.collaboratorId = props.collaboratorId;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.amount = props.amount;
    this.expenseDate = props.expenseDate;
    this.receiptPath = props.receiptPath;
    this.receiptFileName = props.receiptFileName;
    this.receiptUploadedAt = props.receiptUploadedAt;
    this.receiptFileSize = props.receiptFileSize;
    this.receiptMimeType = props.receiptMimeType;
    this.status = props.status;
    this.approvedBy = props.approvedBy;
    this.approvedAt = props.approvedAt;
    this.rejectionReason = props.rejectionReason;
    this.rejectedBy = props.rejectedBy;
    this.rejectedAt = props.rejectedAt;
    this.paidBy = props.paidBy;
    this.paidAt = props.paidAt;
    this.paymentReference = props.paymentReference;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  canUpdate(): boolean {
    return this.status === 'draft';
  }

  canApprove(): boolean {
    return this.status === 'pending';
  }

  canReject(): boolean {
    return this.status === 'pending';
  }

  canPay(): boolean {
    return this.status === 'approved' || this.status === 'processing';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      collaboratorId: this.collaboratorId,
      title: this.title,
      description: this.description,
      category: this.category,
      amount: this.amount,
      expenseDate: this.expenseDate,
      receiptPath: this.receiptPath,
      receiptFileName: this.receiptFileName,
      receiptUploadedAt: this.receiptUploadedAt?.toISOString() ?? null,
      receiptFileSize: this.receiptFileSize,
      receiptMimeType: this.receiptMimeType,
      status: this.status,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt?.toISOString() ?? null,
      rejectionReason: this.rejectionReason,
      rejectedBy: this.rejectedBy,
      rejectedAt: this.rejectedAt?.toISOString() ?? null,
      paidBy: this.paidBy,
      paidAt: this.paidAt?.toISOString() ?? null,
      paymentReference: this.paymentReference,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
