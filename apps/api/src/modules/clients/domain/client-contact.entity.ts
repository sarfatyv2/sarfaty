export interface ClientContactProps {
  id: string;
  clientId: string;
  contactName: string | null;
  useType: string | null;
  email: string | null;
  emailSecondary: string | null;
  phone: string | null;
  phoneMobile: string | null;
  phoneSms: string | null;
  whatsapp: boolean;
  homepage: string | null;
  notes: string | null;
  source: string | null;
  sourceQueriedAt: Date | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ClientContact {
  readonly id: string;
  readonly clientId: string;
  readonly contactName: string | null;
  readonly useType: string | null;
  readonly email: string | null;
  readonly emailSecondary: string | null;
  readonly phone: string | null;
  readonly phoneMobile: string | null;
  readonly phoneSms: string | null;
  readonly whatsapp: boolean;
  readonly homepage: string | null;
  readonly notes: string | null;
  readonly source: string | null;
  readonly sourceQueriedAt: Date | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: ClientContactProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.contactName = props.contactName;
    this.useType = props.useType;
    this.email = props.email;
    this.emailSecondary = props.emailSecondary;
    this.phone = props.phone;
    this.phoneMobile = props.phoneMobile;
    this.phoneSms = props.phoneSms;
    this.whatsapp = props.whatsapp;
    this.homepage = props.homepage;
    this.notes = props.notes;
    this.source = props.source;
    this.sourceQueriedAt = props.sourceQueriedAt;
    this.isPrimary = props.isPrimary;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ClientContactProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ClientContact {
    return new ClientContact({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: ClientContactProps): ClientContact {
    return new ClientContact(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      contactName: this.contactName,
      useType: this.useType,
      email: this.email,
      emailSecondary: this.emailSecondary,
      phone: this.phone,
      phoneMobile: this.phoneMobile,
      phoneSms: this.phoneSms,
      whatsapp: this.whatsapp,
      homepage: this.homepage,
      notes: this.notes,
      source: this.source,
      sourceQueriedAt: this.sourceQueriedAt?.toISOString() ?? null,
      isPrimary: this.isPrimary,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
