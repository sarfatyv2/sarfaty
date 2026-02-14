import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';

@Injectable()
export class RejectInvoiceUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
  ) {}

  async execute(
    invoiceId: string,
    profileId: string,
    reason: string,
  ): Promise<PjInvoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!invoice.canReject()) {
      throw new Error(`Cannot reject: invoice status is ${invoice.status}`);
    }
    if (!reason?.trim()) {
      throw new Error('Rejection reason is required');
    }

    const updated = await this.invoiceRepository.update(invoiceId, {
      status: 'rejected',
      reviewedBy: profileId,
      reviewedAt: new Date(),
      rejectionReason: reason.trim(),
    });

    if (!updated) {
      throw new Error('Failed to reject invoice');
    }
    return updated;
  }
}
