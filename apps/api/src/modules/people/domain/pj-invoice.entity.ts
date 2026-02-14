import type { PjInvoiceStatus } from '@nexus/utils';

export interface PjInvoiceProps {
  id: string;
  collaboratorId: string;
  referenceMonth: number;
  referenceYear: number;
  invoiceNumber: string | null;
  invoiceAmount: string;
  invoicePath: string | null;
  invoiceFileName: string | null;
  uploadedAt: Date | null;
  uploadedBy: string | null;
  invoiceFileSize: number | null;
  invoiceMimeType: string | null;
  status: PjInvoiceStatus;
  approvedByFinance1: string | null;
  approvedAtFinance1: Date | null;
  approvedByFinance2: string | null;
  approvedAtFinance2: Date | null;
  paidAt: Date | null;
  paymentReference: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  reminderSentAt: Date | null;
  reminderCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class PjInvoice {
  readonly id: string;
  readonly collaboratorId: string;
  readonly referenceMonth: number;
  readonly referenceYear: number;
  readonly invoiceNumber: string | null;
  readonly invoiceAmount: string;
  readonly invoicePath: string | null;
  readonly invoiceFileName: string | null;
  readonly uploadedAt: Date | null;
  readonly uploadedBy: string | null;
  readonly invoiceFileSize: number | null;
  readonly invoiceMimeType: string | null;
  readonly status: PjInvoiceStatus;
  readonly approvedByFinance1: string | null;
  readonly approvedAtFinance1: Date | null;
  readonly approvedByFinance2: string | null;
  readonly approvedAtFinance2: Date | null;
  readonly paidAt: Date | null;
  readonly paymentReference: string | null;
  readonly reviewedBy: string | null;
  readonly reviewedAt: Date | null;
  readonly rejectionReason: string | null;
  readonly reminderSentAt: Date | null;
  readonly reminderCount: number;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(props: PjInvoiceProps) {
    this.id = props.id;
    this.collaboratorId = props.collaboratorId;
    this.referenceMonth = props.referenceMonth;
    this.referenceYear = props.referenceYear;
    this.invoiceNumber = props.invoiceNumber;
    this.invoiceAmount = props.invoiceAmount;
    this.invoicePath = props.invoicePath;
    this.invoiceFileName = props.invoiceFileName;
    this.uploadedAt = props.uploadedAt;
    this.uploadedBy = props.uploadedBy;
    this.invoiceFileSize = props.invoiceFileSize;
    this.invoiceMimeType = props.invoiceMimeType;
    this.status = props.status;
    this.approvedByFinance1 = props.approvedByFinance1;
    this.approvedAtFinance1 = props.approvedAtFinance1;
    this.approvedByFinance2 = props.approvedByFinance2;
    this.approvedAtFinance2 = props.approvedAtFinance2;
    this.paidAt = props.paidAt;
    this.paymentReference = props.paymentReference;
    this.reviewedBy = props.reviewedBy;
    this.reviewedAt = props.reviewedAt;
    this.rejectionReason = props.rejectionReason;
    this.reminderSentAt = props.reminderSentAt;
    this.reminderCount = props.reminderCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  canUpload(): boolean {
    return this.status === 'pending_upload' || this.status === 'overdue';
  }

  canApprove(): boolean {
    return this.status === 'pending_review';
  }

  canReject(): boolean {
    return this.status === 'pending_review';
  }

  canPay(): boolean {
    return this.status === 'approved' || this.status === 'pending_approval' || this.status === 'payment_scheduled';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      collaboratorId: this.collaboratorId,
      referenceMonth: this.referenceMonth,
      referenceYear: this.referenceYear,
      invoiceNumber: this.invoiceNumber,
      invoiceAmount: this.invoiceAmount,
      invoicePath: this.invoicePath,
      invoiceFileName: this.invoiceFileName,
      uploadedAt: this.uploadedAt?.toISOString() ?? null,
      uploadedBy: this.uploadedBy,
      invoiceFileSize: this.invoiceFileSize,
      invoiceMimeType: this.invoiceMimeType,
      status: this.status,
      approvedByFinance1: this.approvedByFinance1,
      approvedAtFinance1: this.approvedAtFinance1?.toISOString() ?? null,
      approvedByFinance2: this.approvedByFinance2,
      approvedAtFinance2: this.approvedAtFinance2?.toISOString() ?? null,
      paidAt: this.paidAt?.toISOString() ?? null,
      paymentReference: this.paymentReference,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt?.toISOString() ?? null,
      rejectionReason: this.rejectionReason,
      reminderSentAt: this.reminderSentAt?.toISOString() ?? null,
      reminderCount: this.reminderCount,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
