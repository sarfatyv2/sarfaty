import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';

export interface PayInvoiceInput {
  invoiceId: string;
  profileId: string;
  paymentReference?: string;
}

@Injectable()
export class PayInvoiceUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
  ) {}

  async execute(input: PayInvoiceInput): Promise<PjInvoice> {
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!invoice.canPay()) {
      throw new Error(`Cannot pay: invoice status is ${invoice.status}`);
    }

    const updated = await this.invoiceRepository.update(input.invoiceId, {
      status: 'paid',
      paidAt: new Date(),
      paymentReference: input.paymentReference ?? null,
    });

    if (!updated) {
      throw new Error('Failed to mark invoice as paid');
    }
    return updated;
  }
}
