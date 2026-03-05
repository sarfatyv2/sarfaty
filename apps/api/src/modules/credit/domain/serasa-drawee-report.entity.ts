export interface SerasaDraweeReportProps {
  id: string;
  draweeId: string;
  cnpj: string;
  reportName: string;
  optionalFeatures: string[] | null;
  statusCode: number;
  rawResponse: unknown;
  errorMessage: string | null;
  requestId: string | null;
  createdAt: Date;
}

export class SerasaDraweeReport {
  constructor(private readonly props: SerasaDraweeReportProps) {}

  get id(): string { return this.props.id; }
  get draweeId(): string { return this.props.draweeId; }
  get cnpj(): string { return this.props.cnpj; }
  get reportName(): string { return this.props.reportName; }
  get optionalFeatures(): string[] | null { return this.props.optionalFeatures; }
  get statusCode(): number { return this.props.statusCode; }
  get rawResponse(): unknown { return this.props.rawResponse; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get requestId(): string | null { return this.props.requestId; }
  get createdAt(): Date { return this.props.createdAt; }

  get isSuccess(): boolean { return this.props.statusCode >= 200 && this.props.statusCode < 300; }

  static create(props: Omit<SerasaDraweeReportProps, 'id' | 'createdAt'>): SerasaDraweeReport {
    return new SerasaDraweeReport({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: SerasaDraweeReportProps): SerasaDraweeReport {
    return new SerasaDraweeReport(props);
  }
}
