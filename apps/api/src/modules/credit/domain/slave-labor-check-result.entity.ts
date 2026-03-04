export interface SlaveLaborCheckResultProps {
  id: string;
  clientId: string;
  cnpj: string | null;
  hasMatch: boolean;
  employerName: string | null;
  rescuedWorkers: number | null;
  inspectionDate: Date | null;
  rawData: any | null;
  queriedAt: Date;
}

export class SlaveLaborCheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly cnpj: string | null;
  readonly hasMatch: boolean;
  readonly employerName: string | null;
  readonly rescuedWorkers: number | null;
  readonly inspectionDate: Date | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: SlaveLaborCheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.cnpj = props.cnpj;
    this.hasMatch = props.hasMatch;
    this.employerName = props.employerName;
    this.rescuedWorkers = props.rescuedWorkers;
    this.inspectionDate = props.inspectionDate;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<SlaveLaborCheckResultProps, 'id' | 'queriedAt'> & { id?: string }): SlaveLaborCheckResult {
    return new SlaveLaborCheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: SlaveLaborCheckResultProps): SlaveLaborCheckResult {
    return new SlaveLaborCheckResult(props);
  }
}
