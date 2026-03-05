export interface AddressValidationDraweeResultProps {
  id: string;
  draweeId: string;
  cep: string | null;
  isValid: boolean;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  matchesRegistered: boolean | null;
  rawData: unknown;
  queriedAt: Date;
}

export class AddressValidationDraweeResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cep: string | null;
  readonly isValid: boolean;
  readonly street: string | null;
  readonly neighborhood: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly matchesRegistered: boolean | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: AddressValidationDraweeResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cep = props.cep;
    this.isValid = props.isValid;
    this.street = props.street;
    this.neighborhood = props.neighborhood;
    this.city = props.city;
    this.state = props.state;
    this.matchesRegistered = props.matchesRegistered;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<AddressValidationDraweeResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): AddressValidationDraweeResult {
    return new AddressValidationDraweeResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: AddressValidationDraweeResultProps): AddressValidationDraweeResult {
    return new AddressValidationDraweeResult(props);
  }
}
