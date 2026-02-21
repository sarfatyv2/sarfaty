export interface VaduPersonResultProps {
  id: string;
  clientId: string;
  authorizedPersonId: string | null;
  cpf: string | null;
  name: string | null;
  birthDate: Date | null;
  motherName: string | null;
  rawData: any | null;
  queriedAt: Date;
}

export class VaduPersonResult {
  readonly id: string;
  readonly clientId: string;
  readonly authorizedPersonId: string | null;
  readonly cpf: string | null;
  readonly name: string | null;
  readonly birthDate: Date | null;
  readonly motherName: string | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: VaduPersonResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.authorizedPersonId = props.authorizedPersonId;
    this.cpf = props.cpf;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.motherName = props.motherName;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<VaduPersonResultProps, 'id' | 'queriedAt'> & { id?: string }): VaduPersonResult {
    return new VaduPersonResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: VaduPersonResultProps): VaduPersonResult {
    return new VaduPersonResult(props);
  }
}
