export type CndtCertificateStatus = 'NEGATIVE' | 'POSITIVE' | 'POSITIVE_WITH_EFFECTS' | 'UNAVAILABLE' | 'UNKNOWN';

export interface CndtCheckResultProps {
  id: string;
  clientId: string;
  cnpj: string | null;
  certificateStatus: CndtCertificateStatus;
  certificateNumber: string | null;
  validUntil: Date | null;
  rawData: Record<string, unknown> | null;
  queriedAt: Date;
}

export class CndtCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly cnpj: string | null;
  readonly certificateStatus: CndtCertificateStatus;
  readonly certificateNumber: string | null;
  readonly validUntil: Date | null;
  readonly rawData: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: CndtCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.cnpj = props.cnpj;
    this.certificateStatus = props.certificateStatus;
    this.certificateNumber = props.certificateNumber;
    this.validUntil = props.validUntil;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<CndtCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): CndtCheckResult {
    return new CndtCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: CndtCheckResultProps): CndtCheckResult {
    return new CndtCheckResult(props);
  }
}
