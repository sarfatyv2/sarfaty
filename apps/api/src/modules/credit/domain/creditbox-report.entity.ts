export type CreditboxReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export interface CreditboxReportProps {
  id: string;
  clientId: string;
  processId: string | null;
  status: CreditboxReportStatus;
  reportJson: any | null;
  pdfBase64: string | null;
  errorMessage: string | null;
  requestedAt: Date;
  completedAt: Date | null;
}

export class CreditboxReport {
  constructor(private readonly props: CreditboxReportProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get processId(): string | null { return this.props.processId; }
  get status(): CreditboxReportStatus { return this.props.status; }
  get reportJson(): any | null { return this.props.reportJson; }
  get pdfBase64(): string | null { return this.props.pdfBase64; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get completedAt(): Date | null { return this.props.completedAt; }

  static create(props: Omit<CreditboxReportProps, 'id' | 'requestedAt'>): CreditboxReport {
    return new CreditboxReport({
      ...props,
      id: crypto.randomUUID(),
      requestedAt: new Date(),
    });
  }

  static reconstruct(props: CreditboxReportProps): CreditboxReport {
    return new CreditboxReport(props);
  }

  markAsCompleted(reportJson: any, pdfBase64: string | null): void {
    this.props.status = 'COMPLETED';
    this.props.reportJson = reportJson;
    this.props.pdfBase64 = pdfBase64;
    this.props.completedAt = new Date();
  }

  markAsError(message: string): void {
    this.props.status = 'ERROR';
    this.props.errorMessage = message;
    this.props.completedAt = new Date();
  }
}
