import {
  Collaborator,
  type CollaboratorProps,
  type CollaboratorCltData,
  type CollaboratorPjData,
} from '../../domain/collaborator.entity';

export interface CollaboratorRow {
  id: string;
  profileId: string | null;
  isActive: boolean;
  registrationNumber: string | null;
  badgeNumber: string | null;
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
  terminationDate: string | null;
  terminationReason: string | null;
  hasMedicalAssistance: boolean | null;
  medicalPlanNotes: string | null;
  plrEligible: boolean | null;
  thirteenthPj: boolean | null;
  guaranteedBonus: string | null;
  commissionPct: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountType: string | null;
  currentSalary: string | null;
  lastMovementDate: string | null;
  lastMovementType: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function fromNumericString(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

interface CltDataRow {
  ctpsNumber: string | null;
  ctpsSeries: string | null;
  pisPasep: string | null;
  timesheetSystem: string | null;
  timesheetId: string | null;
}

interface PjDataRow {
  companyName: string | null;
  companyCnpj: string | null;
  companyCnae: string | null;
  monthlyNfAmount: string | null;
  nfDueDay: number | null;
}

export class CollaboratorMapper {
  static toDomain(
    row: CollaboratorRow,
    cltRow?: CltDataRow | null,
    pjRow?: PjDataRow | null,
  ): Collaborator {
    const props: CollaboratorProps = {
      id: row.id,
      profileId: row.profileId,
      isActive: row.isActive,
      registrationNumber: row.registrationNumber,
      badgeNumber: row.badgeNumber,
      employmentType: row.employmentType,
      isInternal: row.isInternal ?? true,
      fullName: row.fullName,
      socialName: row.socialName,
      dateOfBirth: row.dateOfBirth,
      gender: row.gender,
      maritalStatus: row.maritalStatus,
      nationality: row.nationality ?? 'Brasileira',
      cpf: row.cpf,
      rg: row.rg,
      rgIssuer: row.rgIssuer,
      voterRegistration: row.voterRegistration,
      voterZone: row.voterZone,
      voterSection: row.voterSection,
      militaryCert: row.militaryCert,
      addressStreet: row.addressStreet,
      addressNumber: row.addressNumber,
      addressComplement: row.addressComplement,
      addressNeighborhood: row.addressNeighborhood,
      addressCity: row.addressCity,
      addressState: row.addressState,
      addressZip: row.addressZip,
      phone: row.phone,
      personalEmail: row.personalEmail,
      corporateEmail: row.corporateEmail,
      extension: row.extension,
      company: row.company ?? 'Sarfaty',
      directorate: row.directorate,
      department: row.department,
      branch: row.branch,
      managerId: row.managerId,
      jobTitle: row.jobTitle,
      roleCode: row.roleCode,
      roleLevel: row.roleLevel,
      startDateOriginal: row.startDateOriginal,
      startDateCurrent: row.startDateCurrent,
      registrationDate: row.registrationDate,
      terminationDate: row.terminationDate,
      terminationReason: row.terminationReason,
      hasMedicalAssistance: row.hasMedicalAssistance ?? true,
      medicalPlanNotes: row.medicalPlanNotes,
      plrEligible: row.plrEligible ?? false,
      thirteenthPj: row.thirteenthPj ?? false,
      guaranteedBonus: fromNumericString(row.guaranteedBonus),
      commissionPct: fromNumericString(row.commissionPct),
      bankName: row.bankName,
      bankBranch: row.bankBranch,
      bankAccount: row.bankAccount,
      bankAccountType: row.bankAccountType,
      currentSalary: fromNumericString(row.currentSalary),
      lastMovementDate: row.lastMovementDate,
      lastMovementType: row.lastMovementType,
      notes: row.notes,
      createdAt: row.createdAt?.toISOString() ?? null,
      updatedAt: row.updatedAt?.toISOString() ?? null,
      cltData: cltRow
        ? ({
            ctpsNumber: cltRow.ctpsNumber,
            ctpsSeries: cltRow.ctpsSeries,
            pisPasep: cltRow.pisPasep,
            timesheetSystem: cltRow.timesheetSystem,
            timesheetId: cltRow.timesheetId,
          } satisfies CollaboratorCltData)
        : undefined,
      pjData: pjRow
        ? ({
            companyName: pjRow.companyName,
            companyCnpj: pjRow.companyCnpj,
            companyCnae: pjRow.companyCnae,
            monthlyNfAmount: pjRow.monthlyNfAmount
              ? Number(pjRow.monthlyNfAmount)
              : null,
            nfDueDay: pjRow.nfDueDay,
          } satisfies CollaboratorPjData)
        : undefined,
    };

    return Collaborator.reconstitute(props);
  }
}
