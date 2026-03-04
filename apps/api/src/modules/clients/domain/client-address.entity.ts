export interface ClientAddressProps {
  id: string;
  clientId: string;
  useType: string | null;
  street: string | null;
  number: string | null;
  withoutNumber: boolean;
  complement: string | null;
  neighborhood: string | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  sourceQueriedAt: Date | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ClientAddress {
  readonly id: string;
  readonly clientId: string;
  readonly useType: string | null;
  readonly street: string | null;
  readonly number: string | null;
  readonly withoutNumber: boolean;
  readonly complement: string | null;
  readonly neighborhood: string | null;
  readonly zipCode: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly source: string | null;
  readonly sourceQueriedAt: Date | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: ClientAddressProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.useType = props.useType;
    this.street = props.street;
    this.number = props.number;
    this.withoutNumber = props.withoutNumber;
    this.complement = props.complement;
    this.neighborhood = props.neighborhood;
    this.zipCode = props.zipCode;
    this.city = props.city;
    this.state = props.state;
    this.source = props.source;
    this.sourceQueriedAt = props.sourceQueriedAt;
    this.isPrimary = props.isPrimary;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ClientAddressProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ClientAddress {
    return new ClientAddress({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: ClientAddressProps): ClientAddress {
    return new ClientAddress(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      useType: this.useType,
      street: this.street,
      number: this.number,
      withoutNumber: this.withoutNumber,
      complement: this.complement,
      neighborhood: this.neighborhood,
      zipCode: this.zipCode,
      city: this.city,
      state: this.state,
      source: this.source,
      sourceQueriedAt: this.sourceQueriedAt?.toISOString() ?? null,
      isPrimary: this.isPrimary,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
