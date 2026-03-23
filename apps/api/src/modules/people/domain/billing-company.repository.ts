import type { BillingCompany } from './billing-company.entity';

export const BILLING_COMPANY_REPOSITORY = Symbol('BILLING_COMPANY_REPOSITORY');

export interface CreateBillingCompanyData {
  name: string;
  tradeName: string | null;
  cnpj: string;
  isActive: boolean;
}

export interface UpdateBillingCompanyData {
  name?: string;
  tradeName?: string | null;
  cnpj?: string;
  isActive?: boolean;
}

export interface BillingCompanyRepository {
  findAll(includeInactive?: boolean): Promise<BillingCompany[]>;
  findById(id: string): Promise<BillingCompany | null>;
  create(data: CreateBillingCompanyData): Promise<BillingCompany>;
  update(id: string, data: UpdateBillingCompanyData): Promise<BillingCompany | null>;
}
