export interface AllcheckResultProps {
  id: string;
  clientId: string;
  document: string | null;
  name: string | null;
  emails: unknown;
  currentAddress: unknown;
  addressHistory: unknown;
  phones: unknown;
  partners: unknown;
  companyData: unknown;
  isPep: boolean;
  vehicles: unknown;
  ccfOccurrences: number;
  consultationNetwork: unknown;
  rawData: unknown;
  queriedAt: Date;
}

export class AllcheckResult {
  readonly id: string;
  readonly clientId: string;
  readonly document: string | null;
  readonly name: string | null;
  readonly emails: unknown;
  readonly currentAddress: unknown;
  readonly addressHistory: unknown;
  readonly phones: unknown;
  readonly partners: unknown;
  readonly companyData: unknown;
  readonly isPep: boolean;
  readonly vehicles: unknown;
  readonly ccfOccurrences: number;
  readonly consultationNetwork: unknown;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: AllcheckResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.document = props.document;
    this.name = props.name;
    this.emails = props.emails;
    this.currentAddress = props.currentAddress;
    this.addressHistory = props.addressHistory;
    this.phones = props.phones;
    this.partners = props.partners;
    this.companyData = props.companyData;
    this.isPep = props.isPep;
    this.vehicles = props.vehicles;
    this.ccfOccurrences = props.ccfOccurrences;
    this.consultationNetwork = props.consultationNetwork;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<AllcheckResultProps, 'id' | 'queriedAt'> & { id?: string }): AllcheckResult {
    return new AllcheckResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: AllcheckResultProps): AllcheckResult {
    return new AllcheckResult(props);
  }
}
