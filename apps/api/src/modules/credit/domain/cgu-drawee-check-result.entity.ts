export type CguCheckType = 'CEIS' | 'CNEP' | 'CEPIM';

export interface CguDraweeCheckResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  checkType: CguCheckType;
  hasMatch: boolean;
  matchCount: number;
  summary: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class CguDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly checkType: CguCheckType;
  readonly hasMatch: boolean;
  readonly matchCount: number;
  readonly summary: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: CguDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.checkType = props.checkType;
    this.hasMatch = props.hasMatch;
    this.matchCount = props.matchCount;
    this.summary = props.summary;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<CguDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): CguDraweeCheckResult {
    return new CguDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: CguDraweeCheckResultProps): CguDraweeCheckResult {
    return new CguDraweeCheckResult(props);
  }
}
