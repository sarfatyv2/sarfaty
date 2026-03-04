export type CguCheckType = 'CEIS' | 'CNEP' | 'CEPIM';

export interface CguCheckResultProps {
  id: string;
  clientId: string;
  cnpj: string | null;
  checkType: CguCheckType;
  hasMatch: boolean;
  matchCount: number;
  summary: string | null;
  rawData: any | null;
  queriedAt: Date;
}

export class CguCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly cnpj: string | null;
  readonly checkType: CguCheckType;
  readonly hasMatch: boolean;
  readonly matchCount: number;
  readonly summary: string | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: CguCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.cnpj = props.cnpj;
    this.checkType = props.checkType;
    this.hasMatch = props.hasMatch;
    this.matchCount = props.matchCount;
    this.summary = props.summary;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<CguCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): CguCheckResult {
    return new CguCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: CguCheckResultProps): CguCheckResult {
    return new CguCheckResult(props);
  }
}
