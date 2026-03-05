export type MediaRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

export interface NegativeMediaDraweeResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  companyName: string | null;
  riskLevel: MediaRiskLevel;
  findingsCount: number;
  findings: Record<string, unknown>[] | null;
  summary: string | null;
  groundingSources: Record<string, unknown>[] | null;
  rawResponse: Record<string, unknown> | null;
  queriedAt: Date;
}

export class NegativeMediaDraweeResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly companyName: string | null;
  readonly riskLevel: MediaRiskLevel;
  readonly findingsCount: number;
  readonly findings: Record<string, unknown>[] | null;
  readonly summary: string | null;
  readonly groundingSources: Record<string, unknown>[] | null;
  readonly rawResponse: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: NegativeMediaDraweeResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.companyName = props.companyName;
    this.riskLevel = props.riskLevel;
    this.findingsCount = props.findingsCount;
    this.findings = props.findings;
    this.summary = props.summary;
    this.groundingSources = props.groundingSources;
    this.rawResponse = props.rawResponse;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<NegativeMediaDraweeResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): NegativeMediaDraweeResult {
    return new NegativeMediaDraweeResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: NegativeMediaDraweeResultProps): NegativeMediaDraweeResult {
    return new NegativeMediaDraweeResult(props);
  }
}
