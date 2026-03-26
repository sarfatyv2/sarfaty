export type UpminerResultStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
export type UpminerParallelStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'ERROR';

export interface UpminerResultProps {
  id: string;
  clientId: string;
  document: string;
  inputType: number;
  searchProfileId: number;
  batchId: number | null;
  status: UpminerResultStatus;
  dossiersData: unknown;
  errorMessage: string | null;
  parallelProcessId: string | null;
  parallelStatus: UpminerParallelStatus | null;
  requestedAt: Date;
  processedAt: Date | null;
}

export class UpminerResult {
  constructor(private readonly props: UpminerResultProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get document(): string { return this.props.document; }
  get inputType(): number { return this.props.inputType; }
  get searchProfileId(): number { return this.props.searchProfileId; }
  get batchId(): number | null { return this.props.batchId; }
  get status(): UpminerResultStatus { return this.props.status; }
  get dossiersData(): unknown { return this.props.dossiersData; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get parallelProcessId(): string | null { return this.props.parallelProcessId; }
  get parallelStatus(): UpminerParallelStatus | null { return this.props.parallelStatus; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get processedAt(): Date | null { return this.props.processedAt; }

  static create(props: Omit<UpminerResultProps, 'id' | 'requestedAt'>): UpminerResult {
    return new UpminerResult({
      ...props,
      id: crypto.randomUUID(),
      requestedAt: new Date(),
    });
  }

  static reconstruct(props: UpminerResultProps): UpminerResult {
    return new UpminerResult(props);
  }

  markAsQueued(batchId: number): void {
    this.props.status = 'QUEUED';
    this.props.batchId = batchId;
  }

  markAsProcessing(): void {
    this.props.status = 'PROCESSING';
  }

  markAsProcessed(dossiersData: unknown): void {
    this.props.status = 'PROCESSED';
    this.props.dossiersData = dossiersData;
    this.props.processedAt = new Date();
  }

  markAsError(message: string): void {
    this.props.status = 'ERROR';
    this.props.errorMessage = message;
    this.props.processedAt = new Date();
  }

  markParallelPending(processId: string): void {
    this.props.parallelProcessId = processId;
    this.props.parallelStatus = 'PENDING';
  }

  markParallelProcessing(): void {
    this.props.parallelStatus = 'PROCESSING';
  }

  markParallelProcessed(): void {
    this.props.parallelStatus = 'PROCESSED';
  }

  markParallelError(): void {
    this.props.parallelStatus = 'ERROR';
  }

  isTerminal(): boolean {
    const batchTerminal = this.props.status === 'PROCESSED' || this.props.status === 'ERROR';
    if (!batchTerminal) return false;

    // If batch errored, treat as fully terminal regardless of parallel state
    if (this.props.status === 'ERROR') return true;

    // Batch processed: only terminal if parallel is settled (null = never triggered, PROCESSED or ERROR)
    const parallelSettled =
      this.props.parallelStatus === null ||
      this.props.parallelStatus === 'PROCESSED' ||
      this.props.parallelStatus === 'ERROR';

    return parallelSettled;
  }
}
