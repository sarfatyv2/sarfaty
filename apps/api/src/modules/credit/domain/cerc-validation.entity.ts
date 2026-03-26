export type CercValidationStatus = 'PENDING' | 'POLLING' | 'PROCESSED' | 'ERROR';

export interface CercValidationProps {
  id: string;

  loteId: string | null;
  validacaoId: string | null;
  veiculoId: string;
  numeroDuplicata: string;
  chaveNfe: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  cnpjOriginador: string;
  referenciaExterna: string | null;
  planodeCobranca: number;

  status: CercValidationStatus;
  statusProcessamento: string | null;

  errorMessage: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  requestedBy: string | null;
}

export class CercValidation {
  constructor(private readonly props: CercValidationProps) {}

  get id(): string { return this.props.id; }
  get loteId(): string | null { return this.props.loteId; }
  get validacaoId(): string | null { return this.props.validacaoId; }
  get veiculoId(): string { return this.props.veiculoId; }
  get numeroDuplicata(): string { return this.props.numeroDuplicata; }
  get chaveNfe(): string { return this.props.chaveNfe; }
  get valor(): number { return this.props.valor; }
  get vencimento(): string { return this.props.vencimento; }
  get cnpjCedente(): string { return this.props.cnpjCedente; }
  get cnpjCpfPagador(): string { return this.props.cnpjCpfPagador; }
  get tipoPagador(): 'cpf' | 'cnpj' { return this.props.tipoPagador; }
  get cnpjOriginador(): string { return this.props.cnpjOriginador; }
  get referenciaExterna(): string | null { return this.props.referenciaExterna; }
  get planodeCobranca(): number { return this.props.planodeCobranca; }
  get status(): CercValidationStatus { return this.props.status; }
  get statusProcessamento(): string | null { return this.props.statusProcessamento; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get processedAt(): Date | null { return this.props.processedAt; }
  get requestedBy(): string | null { return this.props.requestedBy; }

  static create(
    input: Omit<CercValidationProps, 'id' | 'requestedAt' | 'status' | 'loteId' | 'validacaoId' | 'statusProcessamento' | 'errorMessage' | 'processedAt'>,
  ): CercValidation {
    return new CercValidation({
      ...input,
      id: crypto.randomUUID(),
      status: 'PENDING',
      loteId: null,
      validacaoId: null,
      statusProcessamento: null,
      errorMessage: null,
      requestedAt: new Date(),
      processedAt: null,
    });
  }

  static reconstruct(props: CercValidationProps): CercValidation {
    return new CercValidation(props);
  }

  markAsPolling(loteId: string): void {
    this.props.status = 'POLLING';
    this.props.loteId = loteId;
  }

  markAsProcessed(params: {
    validacaoId: string;
    statusProcessamento: string;
  }): void {
    this.props.status = 'PROCESSED';
    this.props.validacaoId = params.validacaoId;
    this.props.statusProcessamento = params.statusProcessamento;
    this.props.processedAt = new Date();
  }

  updatePollingStatus(validacaoId: string, statusProcessamento: string): void {
    this.props.validacaoId = validacaoId;
    this.props.statusProcessamento = statusProcessamento;
  }

  markAsError(message: string): void {
    this.props.status = 'ERROR';
    this.props.errorMessage = message;
    this.props.processedAt = new Date();
  }

  isTerminal(): boolean {
    return this.props.status === 'PROCESSED' || this.props.status === 'ERROR';
  }
}
