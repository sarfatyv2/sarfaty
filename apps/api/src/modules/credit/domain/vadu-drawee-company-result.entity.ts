export interface VaduDraweeCompanyResultProps {
  id: string;
  draweeId: string;
  cnpj: string | null;
  companyName: string | null;
  tradeName: string | null;
  revenueStatus: string | null;
  revenueStatusDate: Date | null;
  specialStatus: string | null;
  capitalSocial: number | null;
  legalNature: string | null;
  isSimplesNacional: boolean | null;
  companySize: string | null;
  environmentalScore: number | null;
  environmentalLevel: string | null;
  rawData: unknown;
  queriedAt: Date;
}

export class VaduDraweeCompanyResult {
  readonly id: string;
  readonly draweeId: string;
  readonly cnpj: string | null;
  readonly companyName: string | null;
  readonly tradeName: string | null;
  readonly revenueStatus: string | null;
  readonly revenueStatusDate: Date | null;
  readonly specialStatus: string | null;
  readonly capitalSocial: number | null;
  readonly legalNature: string | null;
  readonly isSimplesNacional: boolean | null;
  readonly companySize: string | null;
  readonly environmentalScore: number | null;
  readonly environmentalLevel: string | null;
  readonly rawData: unknown;
  readonly queriedAt: Date;

  private constructor(props: VaduDraweeCompanyResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.cnpj = props.cnpj;
    this.companyName = props.companyName;
    this.tradeName = props.tradeName;
    this.revenueStatus = props.revenueStatus;
    this.revenueStatusDate = props.revenueStatusDate;
    this.specialStatus = props.specialStatus;
    this.capitalSocial = props.capitalSocial;
    this.legalNature = props.legalNature;
    this.isSimplesNacional = props.isSimplesNacional;
    this.companySize = props.companySize;
    this.environmentalScore = props.environmentalScore;
    this.environmentalLevel = props.environmentalLevel;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<VaduDraweeCompanyResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): VaduDraweeCompanyResult {
    return new VaduDraweeCompanyResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: VaduDraweeCompanyResultProps): VaduDraweeCompanyResult {
    return new VaduDraweeCompanyResult(props);
  }
}
