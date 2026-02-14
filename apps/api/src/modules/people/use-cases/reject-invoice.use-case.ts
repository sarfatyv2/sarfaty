import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import { InvoiceRejectedEvent } from '../../notifications/domain/events/people-events';

@Injectable()
export class RejectInvoiceUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    private readonly eventEmitter: EventEmitter2,
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

    this.eventEmitter.emit(
      InvoiceRejectedEvent.EVENT_NAME,
      new InvoiceRejectedEvent(
        invoiceId,
        invoice.collaboratorId,
        invoice.referenceMonth,
        invoice.referenceYear,
        reason.trim(),
        profileId,
      ),
    );

    return updated;
  }
}
