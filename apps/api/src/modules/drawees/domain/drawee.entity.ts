import type { PersonType } from '@nexus/types';

export interface DraweeProps {
  id: string;
  personType: PersonType;
  cpf: string | null;
  cnpj: string | null;
  cnpjRoot: string | null;
  tradeName: string | null;
  companyName: string;
  legalName: string | null;
  foundedAt: string | null;
  rg: string | null;
  birthDate: string | null;
  gender: string | null;
  rgDocumentId: string | null;
  cnhDocumentId: string | null;
  isPep: boolean;
  isOfacListed: boolean;
  riskRating: string | null;
  creditScore: number | null;
  assignedTo: string | null;
  segmentId: string | null;
  economicGroupId: string | null;
  status: string;
  blockedAt: Date | null;
  blockReason: string | null;
  legacySgsId: number | null;
  legacyNfId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Drawee {
  readonly id: string;
  readonly personType: PersonType;
  readonly cpf: string | null;
  readonly cnpj: string | null;
  readonly cnpjRoot: string | null;
  readonly tradeName: string | null;
  readonly companyName: string;
  readonly legalName: string | null;
  readonly foundedAt: string | null;
  readonly rg: string | null;
  readonly birthDate: string | null;
  readonly gender: string | null;
  readonly rgDocumentId: string | null;
  readonly cnhDocumentId: string | null;
  readonly isPep: boolean;
  readonly isOfacListed: boolean;
  readonly riskRating: string | null;
  readonly creditScore: number | null;
  readonly assignedTo: string | null;
  readonly segmentId: string | null;
  readonly economicGroupId: string | null;
  readonly status: string;
  readonly blockedAt: Date | null;
  readonly blockReason: string | null;
  readonly legacySgsId: number | null;
  readonly legacyNfId: number | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: DraweeProps) {
    this.id = props.id;
    this.personType = props.personType;
    this.cpf = props.cpf;
    this.cnpj = props.cnpj;
    this.cnpjRoot = props.cnpjRoot;
    this.tradeName = props.tradeName;
    this.companyName = props.companyName;
    this.legalName = props.legalName;
    this.foundedAt = props.foundedAt;
    this.rg = props.rg;
    this.birthDate = props.birthDate;
    this.gender = props.gender;
    this.rgDocumentId = props.rgDocumentId;
    this.cnhDocumentId = props.cnhDocumentId;
    this.isPep = props.isPep;
    this.isOfacListed = props.isOfacListed;
    this.riskRating = props.riskRating;
    this.creditScore = props.creditScore;
    this.assignedTo = props.assignedTo;
    this.segmentId = props.segmentId;
    this.economicGroupId = props.economicGroupId;
    this.status = props.status;
    this.blockedAt = props.blockedAt;
    this.blockReason = props.blockReason;
    this.legacySgsId = props.legacySgsId;
    this.legacyNfId = props.legacyNfId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<DraweeProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Drawee {
    Drawee.validateCompanyName(props.companyName);

    return new Drawee({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: DraweeProps): Drawee {
    return new Drawee(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      personType: this.personType,
      cpf: this.cpf,
      cnpj: this.cnpj,
      cnpjRoot: this.cnpjRoot,
      tradeName: this.tradeName,
      companyName: this.companyName,
      legalName: this.legalName,
      foundedAt: this.foundedAt,
      rg: this.rg,
      birthDate: this.birthDate,
      gender: this.gender,
      rgDocumentId: this.rgDocumentId,
      cnhDocumentId: this.cnhDocumentId,
      isPep: this.isPep,
      isOfacListed: this.isOfacListed,
      riskRating: this.riskRating,
      creditScore: this.creditScore,
      assignedTo: this.assignedTo,
      segmentId: this.segmentId,
      economicGroupId: this.economicGroupId,
      status: this.status,
      blockedAt: this.blockedAt?.toISOString() ?? null,
      blockReason: this.blockReason,
      legacySgsId: this.legacySgsId,
      legacyNfId: this.legacyNfId,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }

  private static validateCompanyName(name: string): void {
    if ((name?.trim().length ?? 0) < 2) {
      throw new Error('Company name must have at least 2 characters');
    }
  }
}
