export type SerasaReportStatus = 'SUCCESS' | 'ERROR';

export interface SerasaReportProps {
  id: string;
  clientId: string;
  cnpj: string;
  reportName: string;
  optionalFeatures: string[] | null;
  statusCode: number;
  rawResponse: any | null;
  errorMessage: string | null;
  requestId: string | null;
  createdAt: Date;
}

export class SerasaReport {
  constructor(private readonly props: SerasaReportProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get cnpj(): string { return this.props.cnpj; }
  get reportName(): string { return this.props.reportName; }
  get optionalFeatures(): string[] | null { return this.props.optionalFeatures; }
  get statusCode(): number { return this.props.statusCode; }
  get rawResponse(): any | null { return this.props.rawResponse; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get requestId(): string | null { return this.props.requestId; }
  get createdAt(): Date { return this.props.createdAt; }

  get isSuccess(): boolean { return this.props.statusCode >= 200 && this.props.statusCode < 300; }

  static create(props: Omit<SerasaReportProps, 'id' | 'createdAt'>): SerasaReport {
    return new SerasaReport({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: SerasaReportProps): SerasaReport {
    return new SerasaReport(props);
  }
}
