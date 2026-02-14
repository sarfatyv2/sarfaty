import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';

@Injectable()
export class ListOverdueInvoicesUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
  ) {}

  async execute(): Promise<PjInvoice[]> {
    return this.invoiceRepository.findOverdue();
  }
}
