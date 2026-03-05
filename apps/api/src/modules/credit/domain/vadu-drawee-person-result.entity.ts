export interface VaduDraweePersonResultProps {
  id: string;
  draweeId: string;
  cpf: string | null;
  name: string | null;
  birthDate: Date | null;
  motherName: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class VaduDraweePersonResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cpf: string | null;
  readonly name: string | null;
  readonly birthDate: Date | null;
  readonly motherName: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: VaduDraweePersonResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cpf = props.cpf;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.motherName = props.motherName;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<VaduDraweePersonResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): VaduDraweePersonResult {
    return new VaduDraweePersonResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: VaduDraweePersonResultProps): VaduDraweePersonResult {
    return new VaduDraweePersonResult(props);
  }
}
