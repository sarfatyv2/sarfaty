export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly metadata: Record<string, unknown> | undefined;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.metadata = metadata;
  }
}
