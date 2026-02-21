export interface ClientBankAccountProps {
  id: string;
  clientId: string;
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountType: string | null;
  pixKey: string | null;
  nickname: string | null;
  openedAt: string | null;
  closedAt: string | null;
  status: string;
  isPrimary: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ClientBankAccount {
  readonly id: string;
  readonly clientId: string;
  readonly bankCode: string | null;
  readonly bankName: string | null;
  readonly branch: string | null;
  readonly accountNumber: string | null;
  readonly accountType: string | null;
  readonly pixKey: string | null;
  readonly nickname: string | null;
  readonly openedAt: string | null;
  readonly closedAt: string | null;
  readonly status: string;
  readonly isPrimary: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: ClientBankAccountProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.bankCode = props.bankCode;
    this.bankName = props.bankName;
    this.branch = props.branch;
    this.accountNumber = props.accountNumber;
    this.accountType = props.accountType;
    this.pixKey = props.pixKey;
    this.nickname = props.nickname;
    this.openedAt = props.openedAt;
    this.closedAt = props.closedAt;
    this.status = props.status;
    this.isPrimary = props.isPrimary;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ClientBankAccountProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ClientBankAccount {
    return new ClientBankAccount({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: ClientBankAccountProps): ClientBankAccount {
    return new ClientBankAccount(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      bankCode: this.bankCode,
      bankName: this.bankName,
      branch: this.branch,
      accountNumber: this.accountNumber,
      accountType: this.accountType,
      pixKey: this.pixKey,
      nickname: this.nickname,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
      status: this.status,
      isPrimary: this.isPrimary,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
