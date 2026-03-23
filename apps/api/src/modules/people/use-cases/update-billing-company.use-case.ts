import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { BillingCompanyRepository } from '../domain/billing-company.repository';
import { BILLING_COMPANY_REPOSITORY } from '../domain/billing-company.repository';
import type { BillingCompany } from '../domain/billing-company.entity';

function normalizeCnpjDigits(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

@Injectable()
export class UpdateBillingCompanyUseCase {
  constructor(
    @Inject(BILLING_COMPANY_REPOSITORY)
    private readonly billingCompanyRepository: BillingCompanyRepository,
  ) {}

  async execute(
    id: string,
    input: {
      name?: string;
      tradeName?: string | null;
      cnpj?: string;
      isActive?: boolean;
    },
  ): Promise<BillingCompany | null> {
    const patch: {
      name?: string;
      tradeName?: string | null;
      cnpj?: string;
      isActive?: boolean;
    } = {};

    if (input.name !== undefined) {
      patch.name = input.name.trim();
    }
    if (input.tradeName !== undefined) {
      patch.tradeName = input.tradeName?.trim() ?? null;
    }
    if (input.cnpj !== undefined) {
      const digits = normalizeCnpjDigits(input.cnpj);
      if (digits.length !== 14) {
        throw new BadRequestException('Invalid CNPJ');
      }
      patch.cnpj = digits;
    }
    if (input.isActive !== undefined) {
      patch.isActive = input.isActive;
    }

    return this.billingCompanyRepository.update(id, patch);
  }
}
