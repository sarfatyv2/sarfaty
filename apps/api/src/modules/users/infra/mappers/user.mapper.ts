import type { Role } from '@nexus/types';
import { User, type CreateUserProps } from '../../domain/user.entity';

export interface ProfileRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface CollaboratorRow {
  id: string;
  profileId: string | null;
  employmentType: string;
  isInternal: boolean | null;
  fullName: string;
  socialName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  cpf: string | null;
  rg: string | null;
  rgIssuer: string | null;
  voterRegistration: string | null;
  voterZone: string | null;
  voterSection: string | null;
  militaryCert: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  phone: string | null;
  personalEmail: string | null;
  corporateEmail: string | null;
  extension: string | null;
  company: string | null;
  directorate: string | null;
  department: string | null;
  branch: string | null;
  managerId: string | null;
  jobTitle: string | null;
  roleCode: string | null;
  roleLevel: string | null;
  startDateOriginal: string | null;
  startDateCurrent: string | null;
  registrationDate: string | null;
  registrationNumber: string | null;
  badgeNumber: string | null;
  currentSalary: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountType: string | null;
  commissionPct: string | null;
  guaranteedBonus: string | null;
  plrEligible: boolean | null;
  thirteenthPj: boolean | null;
  hasMedicalAssistance: boolean | null;
  medicalPlanNotes: string | null;
  isActive: boolean;
}

export interface CollaboratorInsert {
  profileId: string;
  employmentType: string;
  isInternal: boolean;
  fullName: string;
  socialName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string;
  cpf: string | null;
  rg: string | null;
  rgIssuer: string | null;
  voterRegistration: string | null;
  voterZone: string | null;
  voterSection: string | null;
  militaryCert: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  phone: string | null;
  personalEmail: string | null;
  corporateEmail: string | null;
  extension: string | null;
  company: string;
  directorate: string | null;
  department: string | null;
  branch: string | null;
  managerId: string | null;
  jobTitle: string | null;
  roleCode: string | null;
  roleLevel: string | null;
  startDateOriginal: string | null;
  startDateCurrent: string | null;
  registrationDate: string | null;
  registrationNumber: string | null;
  badgeNumber: string | null;
  currentSalary: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountType: string | null;
  commissionPct: string | null;
  guaranteedBonus: string | null;
  plrEligible: boolean;
  thirteenthPj: boolean;
  hasMedicalAssistance: boolean;
  medicalPlanNotes: string | null;
}

export interface CltDataInsert {
  collaboratorId: string;
  ctpsNumber: string | null;
  ctpsSeries: string | null;
  pisPasep: string | null;
  timesheetSystem: string;
  timesheetId: string | null;
}

export interface PjDataInsert {
  collaboratorId: string;
  companyName: string | null;
  companyCnpj: string | null;
  companyCnae: string | null;
  monthlyNfAmount: string | null;
  nfDueDay: number;
}

function toNumericString(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function fromNumericString(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export class UserMapper {
  static toDomain(
    profile: ProfileRow,
    collaborator?: CollaboratorRow | null,
  ): User {
    const props: CreateUserProps & { isActive?: boolean; createdAt?: string | null } = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role as Role,
      phone: profile.phone,
      isActive: profile.isActive ?? true,
      createdAt: profile.createdAt?.toISOString() ?? null,
    };

    if (collaborator) {
      props.employmentType = collaborator.employmentType as 'clt' | 'pj';
      props.isInternal = collaborator.isInternal ?? true;
      props.socialName = collaborator.socialName;
      props.dateOfBirth = collaborator.dateOfBirth;
      props.gender = collaborator.gender;
      props.maritalStatus = collaborator.maritalStatus;
      props.nationality = collaborator.nationality ?? 'Brasileira';
      props.cpf = collaborator.cpf;
      props.rg = collaborator.rg;
      props.rgIssuer = collaborator.rgIssuer;
      props.voterRegistration = collaborator.voterRegistration;
      props.voterZone = collaborator.voterZone;
      props.voterSection = collaborator.voterSection;
      props.militaryCert = collaborator.militaryCert;
      props.addressStreet = collaborator.addressStreet;
      props.addressNumber = collaborator.addressNumber;
      props.addressComplement = collaborator.addressComplement;
      props.addressNeighborhood = collaborator.addressNeighborhood;
      props.addressCity = collaborator.addressCity;
      props.addressState = collaborator.addressState;
      props.addressZip = collaborator.addressZip;
      props.personalEmail = collaborator.personalEmail;
      props.corporateEmail = collaborator.corporateEmail;
      props.extension = collaborator.extension;
      props.company = collaborator.company ?? 'Sarfaty';
      props.directorate = collaborator.directorate;
      props.department = collaborator.department;
      props.branch = collaborator.branch;
      props.managerId = collaborator.managerId;
      props.jobTitle = collaborator.jobTitle;
      props.roleCode = collaborator.roleCode;
      props.roleLevel = collaborator.roleLevel;
      props.startDateOriginal = collaborator.startDateOriginal;
      props.startDateCurrent = collaborator.startDateCurrent;
      props.registrationDate = collaborator.registrationDate;
      props.registrationNumber = collaborator.registrationNumber;
      props.badgeNumber = collaborator.badgeNumber;
      props.currentSalary = fromNumericString(collaborator.currentSalary);
      props.bankName = collaborator.bankName;
      props.bankBranch = collaborator.bankBranch;
      props.bankAccount = collaborator.bankAccount;
      props.bankAccountType = collaborator.bankAccountType as 'pf' | 'pj' | null;
      props.commissionPct = fromNumericString(collaborator.commissionPct);
      props.guaranteedBonus = fromNumericString(collaborator.guaranteedBonus);
      props.plrEligible = collaborator.plrEligible ?? false;
      props.thirteenthPj = collaborator.thirteenthPj ?? false;
      props.hasMedicalAssistance = collaborator.hasMedicalAssistance ?? true;
      props.medicalPlanNotes = collaborator.medicalPlanNotes;
    }

    return User.reconstitute(props);
  }

  static toPersistence(entity: User): {
    collaborator: CollaboratorInsert;
    cltData?: CltDataInsert;
    pjData?: PjDataInsert;
  } {
    const collaborator: CollaboratorInsert = {
      profileId: entity.id,
      employmentType: entity.employmentType ?? 'clt',
      isInternal: entity.isInternal,
      fullName: entity.fullName,
      socialName: entity.socialName,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender,
      maritalStatus: entity.maritalStatus,
      nationality: entity.nationality,
      cpf: entity.cpf,
      rg: entity.rg,
      rgIssuer: entity.rgIssuer,
      voterRegistration: entity.voterRegistration,
      voterZone: entity.voterZone,
      voterSection: entity.voterSection,
      militaryCert: entity.militaryCert,
      addressStreet: entity.addressStreet,
      addressNumber: entity.addressNumber,
      addressComplement: entity.addressComplement,
      addressNeighborhood: entity.addressNeighborhood,
      addressCity: entity.addressCity,
      addressState: entity.addressState,
      addressZip: entity.addressZip,
      phone: entity.phone,
      personalEmail: entity.personalEmail,
      corporateEmail: entity.corporateEmail,
      extension: entity.extension,
      company: entity.company,
      directorate: entity.directorate,
      department: entity.department,
      branch: entity.branch,
      managerId: entity.managerId,
      jobTitle: entity.jobTitle,
      roleCode: entity.roleCode,
      roleLevel: entity.roleLevel,
      startDateOriginal: entity.startDateOriginal,
      startDateCurrent: entity.startDateCurrent,
      registrationDate: entity.registrationDate,
      registrationNumber: entity.registrationNumber,
      badgeNumber: entity.badgeNumber,
      currentSalary: toNumericString(entity.currentSalary),
      bankName: entity.bankName,
      bankBranch: entity.bankBranch,
      bankAccount: entity.bankAccount,
      bankAccountType: entity.bankAccountType,
      commissionPct: toNumericString(entity.commissionPct),
      guaranteedBonus: toNumericString(entity.guaranteedBonus),
      plrEligible: entity.plrEligible,
      thirteenthPj: entity.thirteenthPj,
      hasMedicalAssistance: entity.hasMedicalAssistance,
      medicalPlanNotes: entity.medicalPlanNotes,
    };

    let cltData: CltDataInsert | undefined;
    let pjData: PjDataInsert | undefined;

    if (entity.isClt) {
      cltData = {
        collaboratorId: '', // Set after collaborator INSERT
        ctpsNumber: entity.ctpsNumber,
        ctpsSeries: entity.ctpsSeries,
        pisPasep: entity.pisPasep,
        timesheetSystem: entity.timesheetSystem,
        timesheetId: entity.timesheetId,
      };
    }

    if (entity.isPj) {
      pjData = {
        collaboratorId: '', // Set after collaborator INSERT
        companyName: entity.companyName,
        companyCnpj: entity.companyCnpj,
        companyCnae: entity.companyCnae,
        monthlyNfAmount: toNumericString(entity.monthlyNfAmount),
        nfDueDay: entity.nfDueDay,
      };
    }

    return { collaborator, cltData, pjData };
  }
}
