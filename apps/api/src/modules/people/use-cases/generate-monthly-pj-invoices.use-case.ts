import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';

export interface GenerateMonthlyPjInvoicesResult {
  created: number;
  skipped: number;
}

@Injectable()
export class GenerateMonthlyPjInvoicesUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(
    referenceYear: number,
    referenceMonth: number,
  ): Promise<GenerateMonthlyPjInvoicesResult> {
    const { collaborators } = await this.collaboratorRepository.findByFilters({
      isActive: true,
      employmentType: 'pj',
      page: 1,
      pageSize: 500,
      sortBy: 'fullName',
      sortOrder: 'asc',
    });

    if (collaborators.length === 0) {
      return { created: 0, skipped: 0 };
    }

    const existing = await this.invoiceRepository.findByFilters({
      referenceYear,
      referenceMonth,
      page: 1,
      pageSize: 500,
    });

    const existingCollaboratorIds = new Set(
      existing.invoices.map((inv) => inv.collaboratorId),
    );

    let created = 0;
    for (const collab of collaborators) {
      if (existingCollaboratorIds.has(collab.id)) {
        continue;
      }

      await this.invoiceRepository.create({
        collaboratorId: collab.id,
        referenceMonth,
        referenceYear,
        invoiceAmount: '0',
        status: 'pending_upload',
      });
      created++;
    }

    return {
      created,
      skipped: collaborators.length - created,
    };
  }
}
