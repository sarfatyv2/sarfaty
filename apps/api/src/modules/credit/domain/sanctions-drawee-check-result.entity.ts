export type SanctionsSource = 'OFAC' | 'UN' | 'EU' | 'OPENSANCTIONS';

export interface SanctionsDraweeCheckResultProps {
  id: string;
  draweeId: string;
  entityName: string | null;
  documentSearched: string | null;
  source: SanctionsSource;
  hasMatch: boolean;
  matchScore: number | null;
  matchDetails: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class SanctionsDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly entityName: string | null;
  readonly documentSearched: string | null;
  readonly source: SanctionsSource;
  readonly hasMatch: boolean;
  readonly matchScore: number | null;
  readonly matchDetails: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: SanctionsDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.entityName = props.entityName;
    this.documentSearched = props.documentSearched;
    this.source = props.source;
    this.hasMatch = props.hasMatch;
    this.matchScore = props.matchScore;
    this.matchDetails = props.matchDetails;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<SanctionsDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): SanctionsDraweeCheckResult {
    return new SanctionsDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: SanctionsDraweeCheckResultProps): SanctionsDraweeCheckResult {
    return new SanctionsDraweeCheckResult(props);
  }
}
