import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';

@Injectable()
export class SendInvoiceRemindersUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
  ) {}

  async execute(): Promise<{ count: number }> {
    const { invoices } = await this.invoiceRepository.findByFilters({
      status: 'pending_upload',
      page: 1,
      pageSize: 500,
    });

    for (const inv of invoices) {
      await this.invoiceRepository.update(inv.id, {
        reminderSentAt: new Date(),
        reminderCount: (inv.reminderCount ?? 0) + 1,
      });
    }

    return { count: invoices.length };
  }
}
