export interface BillingCompanyProps {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class BillingCompany {
  readonly id: string;
  readonly name: string;
  readonly tradeName: string | null;
  readonly cnpj: string;
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(props: BillingCompanyProps) {
    this.id = props.id;
    this.name = props.name;
    this.tradeName = props.tradeName;
    this.cnpj = props.cnpj;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      tradeName: this.tradeName,
      cnpj: this.cnpj,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
