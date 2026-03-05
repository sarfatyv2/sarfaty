export interface SlaveLaborDraweeCheckResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  hasMatch: boolean;
  employerName: string | null;
  rescuedWorkers: number | null;
  inspectionDate: Date | null;
  rawData: unknown;
  queriedAt: Date;
}

export class SlaveLaborDraweeCheckResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly hasMatch: boolean;
  readonly employerName: string | null;
  readonly rescuedWorkers: number | null;
  readonly inspectionDate: Date | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: SlaveLaborDraweeCheckResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.hasMatch = props.hasMatch;
    this.employerName = props.employerName;
    this.rescuedWorkers = props.rescuedWorkers;
    this.inspectionDate = props.inspectionDate;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<SlaveLaborDraweeCheckResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): SlaveLaborDraweeCheckResult {
    return new SlaveLaborDraweeCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: SlaveLaborDraweeCheckResultProps): SlaveLaborDraweeCheckResult {
    return new SlaveLaborDraweeCheckResult(props);
  }
}
