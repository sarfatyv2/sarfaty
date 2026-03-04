export type SanctionsSource = 'OFAC' | 'UN' | 'EU' | 'OPENSANCTIONS';

export interface SanctionsCheckResultProps {
  id: string;
  clientId: string;
  entityName: string | null;
  documentSearched: string | null;
  source: SanctionsSource;
  hasMatch: boolean;
  matchScore: number | null;
  matchDetails: string | null;
  rawData: any | null;
  queriedAt: Date;
}

export class SanctionsCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly entityName: string | null;
  readonly documentSearched: string | null;
  readonly source: SanctionsSource;
  readonly hasMatch: boolean;
  readonly matchScore: number | null;
  readonly matchDetails: string | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: SanctionsCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.entityName = props.entityName;
    this.documentSearched = props.documentSearched;
    this.source = props.source;
    this.hasMatch = props.hasMatch;
    this.matchScore = props.matchScore;
    this.matchDetails = props.matchDetails;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<SanctionsCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): SanctionsCheckResult {
    return new SanctionsCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: SanctionsCheckResultProps): SanctionsCheckResult {
    return new SanctionsCheckResult(props);
  }
}
