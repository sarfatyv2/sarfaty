export class ReimbursementApprovedEvent {
  static readonly EVENT_NAME = 'reimbursement.approved';

  constructor(
    public readonly reimbursementId: string,
    public readonly collaboratorId: string,
    public readonly title: string,
    public readonly actorId: string,
  ) {}
}

export class ReimbursementRejectedEvent {
  static readonly EVENT_NAME = 'reimbursement.rejected';

  constructor(
    public readonly reimbursementId: string,
    public readonly collaboratorId: string,
    public readonly title: string,
    public readonly reason: string,
    public readonly actorId: string,
  ) {}
}

export class ReimbursementPendingApprovalEvent {
  static readonly EVENT_NAME = 'reimbursement.pending_approval';

  constructor(
    public readonly reimbursementId: string,
    public readonly collaboratorId: string,
    public readonly title: string,
    public readonly amount: string,
  ) {}
}

export class InvoiceApprovedEvent {
  static readonly EVENT_NAME = 'invoice.approved';

  constructor(
    public readonly invoiceId: string,
    public readonly collaboratorId: string,
    public readonly referenceMonth: number,
    public readonly referenceYear: number,
    public readonly actorId: string,
  ) {}
}

export class InvoiceRejectedEvent {
  static readonly EVENT_NAME = 'invoice.rejected';

  constructor(
    public readonly invoiceId: string,
    public readonly collaboratorId: string,
    public readonly referenceMonth: number,
    public readonly referenceYear: number,
    public readonly reason: string,
    public readonly actorId: string,
  ) {}
}
