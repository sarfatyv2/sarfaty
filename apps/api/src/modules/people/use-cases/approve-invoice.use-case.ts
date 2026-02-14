import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import { InvoiceApprovedEvent } from '../../notifications/domain/events/people-events';

@Injectable()
export class ApproveInvoiceUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(invoiceId: string, profileId: string): Promise<PjInvoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!invoice.canApprove()) {
      throw new Error(`Cannot approve: invoice status is ${invoice.status}`);
    }

    const updated = await this.invoiceRepository.update(invoiceId, {
      status: 'approved',
      reviewedBy: profileId,
      reviewedAt: new Date(),
      rejectionReason: null,
    });

    if (!updated) {
      throw new Error('Failed to approve invoice');
    }

    this.eventEmitter.emit(
      InvoiceApprovedEvent.EVENT_NAME,
      new InvoiceApprovedEvent(
        invoiceId,
        invoice.collaboratorId,
        invoice.referenceMonth,
        invoice.referenceYear,
        profileId,
      ),
    );

    return updated;
  }
}
