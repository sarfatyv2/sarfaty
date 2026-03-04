export interface AddressValidationResultProps {
  id: string;
  clientId: string;
  cep: string | null;
  isValid: boolean;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  matchesRegistered: boolean | null;
  rawData: any | null;
  queriedAt: Date;
}

export class AddressValidationResult {
  readonly id: string;
  readonly clientId: string;
  readonly cep: string | null;
  readonly isValid: boolean;
  readonly street: string | null;
  readonly neighborhood: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly matchesRegistered: boolean | null;
  readonly rawData: any | null;
  readonly queriedAt: Date;

  private constructor(props: AddressValidationResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
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

  static create(props: Omit<AddressValidationResultProps, 'id' | 'queriedAt'> & { id?: string }): AddressValidationResult {
    return new AddressValidationResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: AddressValidationResultProps): AddressValidationResult {
    return new AddressValidationResult(props);
  }
}
