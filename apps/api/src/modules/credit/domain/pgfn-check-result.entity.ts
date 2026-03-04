export interface PgfnCheckResultProps {
  id: string;
  clientId: string;
  cnpj: string | null;
  hasDebt: boolean;
  totalDebtAmount: number | null;
  debtCount: number;
  summary: string | null;
  rawData: any | null;
  queriedAt: Date;
}

export class PgfnCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly cnpj: string | null;
  readonly hasDebt: boolean;
  readonly totalDebtAmount: number | null;
  readonly debtCount: number;
  readonly summary: string | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: PgfnCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.cnpj = props.cnpj;
    this.hasDebt = props.hasDebt;
    this.totalDebtAmount = props.totalDebtAmount;
    this.debtCount = props.debtCount;
    this.summary = props.summary;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<PgfnCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): PgfnCheckResult {
    return new PgfnCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: PgfnCheckResultProps): PgfnCheckResult {
    return new PgfnCheckResult(props);
  }
}
