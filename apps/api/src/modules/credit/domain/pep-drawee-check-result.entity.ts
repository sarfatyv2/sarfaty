export interface PepDraweeCheckResultProps {
  id: string;
  draweeId: string;
  cpf: string | null;
  personName: string | null;
  hasMatch: boolean;
  matchedRole: string | null;
  matchedOrg: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class PepDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cpf: string | null;
  readonly personName: string | null;
  readonly hasMatch: boolean;
  readonly matchedRole: string | null;
  readonly matchedOrg: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: PepDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cpf = props.cpf;
    this.personName = props.personName;
    this.hasMatch = props.hasMatch;
    this.matchedRole = props.matchedRole;
    this.matchedOrg = props.matchedOrg;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<PepDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): PepDraweeCheckResult {
    return new PepDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: PepDraweeCheckResultProps): PepDraweeCheckResult {
    return new PepDraweeCheckResult(props);
  }
}
