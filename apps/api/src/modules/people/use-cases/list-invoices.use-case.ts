import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository, PjInvoiceFilters } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';

export interface ListInvoicesInput {
  profileId: string;
  role: string;
  collaboratorId?: string;
  filters?: {
    status?: string;
    referenceYear?: number;
    referenceMonth?: number;
    page?: number;
    pageSize?: number;
  };
}

@Injectable()
export class ListInvoicesUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(input: ListInvoicesInput): Promise<{ invoices: PjInvoice[]; total: number }> {
    const repoFilters: PjInvoiceFilters = {
      page: input.filters?.page ?? 1,
      pageSize: input.filters?.pageSize ?? 50,
      status: input.filters?.status,
      referenceYear: input.filters?.referenceYear,
      referenceMonth: input.filters?.referenceMonth,
    };

    const dpRoles = ['dp', 'hr_admin', 'admin'];
    if (dpRoles.includes(input.role)) {
      return this.invoiceRepository.findByFilters(repoFilters);
    }

    const collaboratorId = input.collaboratorId ?? (await this.resolveCollaboratorId(input.profileId));
    if (!collaboratorId) {
      return { invoices: [], total: 0 };
    }

    repoFilters.collaboratorId = collaboratorId;
    return this.invoiceRepository.findByFilters(repoFilters);
  }

  private async resolveCollaboratorId(profileId: string): Promise<string | null> {
    const collaborator = await this.collaboratorRepository.findByProfileId(profileId);
    return collaborator?.id ?? null;
  }
}
