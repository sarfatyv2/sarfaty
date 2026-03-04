export interface ClientAuthorizedPersonProps {
  id: string;
  clientId: string;
  authorizationType: string | null;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  sourceQueriedAt: Date | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ClientAuthorizedPerson {
  readonly id: string;
  readonly clientId: string;
  readonly authorizationType: string | null;
  readonly fullName: string;
  readonly cpf: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly source: string | null;
  readonly sourceQueriedAt: Date | null;
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: ClientAuthorizedPersonProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.authorizationType = props.authorizationType;
    this.fullName = props.fullName;
    this.cpf = props.cpf;
    this.phone = props.phone;
    this.email = props.email;
    this.source = props.source;
    this.sourceQueriedAt = props.sourceQueriedAt;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ClientAuthorizedPersonProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ClientAuthorizedPerson {
    return new ClientAuthorizedPerson({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: ClientAuthorizedPersonProps): ClientAuthorizedPerson {
    return new ClientAuthorizedPerson(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      authorizationType: this.authorizationType,
      fullName: this.fullName,
      cpf: this.cpf,
      phone: this.phone,
      email: this.email,
      source: this.source,
      sourceQueriedAt: this.sourceQueriedAt?.toISOString() ?? null,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
