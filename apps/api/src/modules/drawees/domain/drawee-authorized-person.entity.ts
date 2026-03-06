export interface DraweeAuthorizedPersonProps {
  id: string;
  draweeId: string;
  authorizationType: string | null;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  sourceQueriedAt: Date | null;
  joinedAt: Date | null;
  mandateEndAt: Date | null;
  role: string | null;
  participationPercentage: string | null;
  capitalTotalValue: string | null;
  restrictionSign: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class DraweeAuthorizedPerson {
  readonly id: string;
  readonly draweeId: string;
  readonly authorizationType: string | null;
  readonly fullName: string;
  readonly cpf: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly source: string | null;
  readonly sourceQueriedAt: Date | null;
  readonly joinedAt: Date | null;
  readonly mandateEndAt: Date | null;
  readonly role: string | null;
  readonly participationPercentage: string | null;
  readonly capitalTotalValue: string | null;
  readonly restrictionSign: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: DraweeAuthorizedPersonProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.authorizationType = props.authorizationType;
    this.fullName = props.fullName;
    this.cpf = props.cpf;
    this.phone = props.phone;
    this.email = props.email;
    this.source = props.source;
    this.sourceQueriedAt = props.sourceQueriedAt;
    this.joinedAt = props.joinedAt;
    this.mandateEndAt = props.mandateEndAt;
    this.role = props.role;
    this.participationPercentage = props.participationPercentage;
    this.capitalTotalValue = props.capitalTotalValue;
    this.restrictionSign = props.restrictionSign;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<DraweeAuthorizedPersonProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): DraweeAuthorizedPerson {
    return new DraweeAuthorizedPerson({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: DraweeAuthorizedPersonProps): DraweeAuthorizedPerson {
    return new DraweeAuthorizedPerson(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      draweeId: this.draweeId,
      authorizationType: this.authorizationType,
      fullName: this.fullName,
      cpf: this.cpf,
      phone: this.phone,
      email: this.email,
      source: this.source,
      sourceQueriedAt: this.sourceQueriedAt?.toISOString() ?? null,
      joinedAt: this.joinedAt?.toISOString() ?? null,
      mandateEndAt: this.mandateEndAt?.toISOString() ?? null,
      role: this.role,
      participationPercentage: this.participationPercentage,
      capitalTotalValue: this.capitalTotalValue,
      restrictionSign: this.restrictionSign,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
