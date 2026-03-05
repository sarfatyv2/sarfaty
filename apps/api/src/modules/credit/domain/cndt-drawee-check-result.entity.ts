export type CndtCertificateStatus = 'NEGATIVE' | 'POSITIVE' | 'POSITIVE_WITH_EFFECTS' | 'UNAVAILABLE' | 'UNKNOWN';

export interface CndtDraweeCheckResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  certificateStatus: CndtCertificateStatus;
  certificateNumber: string | null;
  validUntil: Date | null;
  rawData: Record<string, unknown> | null;
  queriedAt: Date;
}

export class CndtDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly certificateStatus: CndtCertificateStatus;
  readonly certificateNumber: string | null;
  readonly validUntil: Date | null;
  readonly rawData: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: CndtDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.certificateStatus = props.certificateStatus;
    this.certificateNumber = props.certificateNumber;
    this.validUntil = props.validUntil;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<CndtDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): CndtDraweeCheckResult {
    return new CndtDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: CndtDraweeCheckResultProps): CndtDraweeCheckResult {
    return new CndtDraweeCheckResult(props);
  }
}
