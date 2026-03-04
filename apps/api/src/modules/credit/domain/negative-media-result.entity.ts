export type MediaRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

export interface NegativeMediaResultProps {
  id: string;
  clientId: string;
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

export class NegativeMediaResult {
  readonly id: string;
  readonly clientId: string;
  readonly cnpj: string | null;
  readonly companyName: string | null;
  readonly riskLevel: MediaRiskLevel;
  readonly findingsCount: number;
  readonly findings: Record<string, unknown>[] | null;
  readonly summary: string | null;
  readonly groundingSources: Record<string, unknown>[] | null;
  readonly rawResponse: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: NegativeMediaResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
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

  static create(props: Omit<NegativeMediaResultProps, 'id' | 'queriedAt'> & { id?: string }): NegativeMediaResult {
    return new NegativeMediaResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: NegativeMediaResultProps): NegativeMediaResult {
    return new NegativeMediaResult(props);
  }
}
