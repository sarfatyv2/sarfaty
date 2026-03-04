export interface PepCheckResultProps {
  id: string;
  clientId: string;
  cpf: string | null;
  personName: string | null;
  hasMatch: boolean;
  matchedRole: string | null;
  matchedOrg: string | null;
  rawData: any | null;
  queriedAt: Date;
}

export class PepCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly cpf: string | null;
  readonly personName: string | null;
  readonly hasMatch: boolean;
  readonly matchedRole: string | null;
  readonly matchedOrg: string | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: PepCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.cpf = props.cpf;
    this.personName = props.personName;
    this.hasMatch = props.hasMatch;
    this.matchedRole = props.matchedRole;
    this.matchedOrg = props.matchedOrg;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<PepCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): PepCheckResult {
    return new PepCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: PepCheckResultProps): PepCheckResult {
    return new PepCheckResult(props);
  }
}
