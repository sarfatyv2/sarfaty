export interface BillingCompany {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
