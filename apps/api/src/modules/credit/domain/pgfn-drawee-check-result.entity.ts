export interface PgfnDraweeCheckResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  hasDebt: boolean;
  totalDebtAmount: number | null;
  debtCount: number;
  summary: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class PgfnDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly hasDebt: boolean;
  readonly totalDebtAmount: number | null;
  readonly debtCount: number;
  readonly summary: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: PgfnDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.hasDebt = props.hasDebt;
    this.totalDebtAmount = props.totalDebtAmount;
    this.debtCount = props.debtCount;
    this.summary = props.summary;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<PgfnDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): PgfnDraweeCheckResult {
    return new PgfnDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: PgfnDraweeCheckResultProps): PgfnDraweeCheckResult {
    return new PgfnDraweeCheckResult(props);
  }
}
