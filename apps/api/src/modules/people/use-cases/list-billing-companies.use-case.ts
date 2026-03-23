import { Inject, Injectable } from '@nestjs/common';
import type { BillingCompanyRepository } from '../domain/billing-company.repository';
import { BILLING_COMPANY_REPOSITORY } from '../domain/billing-company.repository';
import type { BillingCompany } from '../domain/billing-company.entity';

@Injectable()
export class ListBillingCompaniesUseCase {
  constructor(
    @Inject(BILLING_COMPANY_REPOSITORY)
    private readonly billingCompanyRepository: BillingCompanyRepository,
  ) {}

  async execute(includeInactive = false): Promise<BillingCompany[]> {
    return this.billingCompanyRepository.findAll(includeInactive);
  }
}
