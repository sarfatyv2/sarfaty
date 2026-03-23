import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { BillingCompanyRepository } from '../domain/billing-company.repository';
import { BILLING_COMPANY_REPOSITORY } from '../domain/billing-company.repository';
import type { BillingCompany } from '../domain/billing-company.entity';

function normalizeCnpjDigits(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

@Injectable()
export class CreateBillingCompanyUseCase {
  constructor(
    @Inject(BILLING_COMPANY_REPOSITORY)
    private readonly billingCompanyRepository: BillingCompanyRepository,
  ) {}

  async execute(input: {
    name: string;
    tradeName: string | null | undefined;
    cnpj: string;
    isActive: boolean;
  }): Promise<BillingCompany> {
    const digits = normalizeCnpjDigits(input.cnpj);
    if (digits.length !== 14) {
      throw new BadRequestException('Invalid CNPJ');
    }
    return this.billingCompanyRepository.create({
      name: input.name.trim(),
      tradeName: input.tradeName?.trim() ?? null,
      cnpj: digits,
      isActive: input.isActive,
    });
  }
}
