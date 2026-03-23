export interface CollaboratorProps {
  id: string;
  profileId: string | null;
  flashEmployeeId: string | null;
  isActive: boolean;
  registrationNumber: string | null;
  badgeNumber: string | null;
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
  terminationDate: string | null;
  terminationReason: string | null;
  hasMedicalAssistance: boolean;
  medicalPlanNotes: string | null;
  plrEligible: boolean;
  thirteenthPj: boolean;
  guaranteedBonus: number | null;
  commissionPct: number | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountType: string | null;
  currentSalary: number | null;
  lastMovementDate: string | null;
  lastMovementType: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cltData?: CollaboratorCltData | null;
  pjData?: CollaboratorPjData | null;
}

export interface CollaboratorCltData {
  ctpsNumber: string | null;
  ctpsSeries: string | null;
  pisPasep: string | null;
  timesheetSystem: string | null;
  timesheetId: string | null;
}

export interface CollaboratorPjData {
  companyName: string | null;
  companyCnpj: string | null;
  companyCnae: string | null;
  monthlyNfAmount: number | null;
  nfDueDay: number | null;
}

/** Fields that an employee can self-edit */
const SELF_EDITABLE_FIELDS = new Set<string>([
  'socialName',
  'phone',
  'personalEmail',
  'addressStreet',
  'addressNumber',
  'addressComplement',
  'addressNeighborhood',
  'addressCity',
  'addressState',
  'addressZip',
  'bankName',
  'bankBranch',
  'bankAccount',
  'bankAccountType',
]);

/** Sensitive fields hidden from people_manager */
const SENSITIVE_FIELDS = new Set<string>([
  'currentSalary',
  'bankName',
  'bankBranch',
  'bankAccount',
  'bankAccountType',
  'commissionPct',
  'guaranteedBonus',
  'plrEligible',
  'thirteenthPj',
  'cpf',
  'rg',
  'rgIssuer',
]);

export class Collaborator {
  readonly id: string;
  readonly profileId: string | null;
  readonly flashEmployeeId: string | null;
  readonly isActive: boolean;
  readonly registrationNumber: string | null;
  readonly badgeNumber: string | null;
  readonly employmentType: string;
  readonly isInternal: boolean;
  readonly fullName: string;
  readonly socialName: string | null;
  readonly dateOfBirth: string | null;
  readonly gender: string | null;
  readonly maritalStatus: string | null;
  readonly nationality: string;
  readonly cpf: string | null;
  readonly rg: string | null;
  readonly rgIssuer: string | null;
  readonly voterRegistration: string | null;
  readonly voterZone: string | null;
  readonly voterSection: string | null;
  readonly militaryCert: string | null;
  readonly addressStreet: string | null;
  readonly addressNumber: string | null;
  readonly addressComplement: string | null;
  readonly addressNeighborhood: string | null;
  readonly addressCity: string | null;
  readonly addressState: string | null;
  readonly addressZip: string | null;
  readonly phone: string | null;
  readonly personalEmail: string | null;
  readonly corporateEmail: string | null;
  readonly extension: string | null;
  readonly company: string;
  readonly directorate: string | null;
  readonly department: string | null;
  readonly branch: string | null;
  readonly managerId: string | null;
  readonly jobTitle: string | null;
  readonly roleCode: string | null;
  readonly roleLevel: string | null;
  readonly startDateOriginal: string | null;
  readonly startDateCurrent: string | null;
  readonly registrationDate: string | null;
  readonly terminationDate: string | null;
  readonly terminationReason: string | null;
  readonly hasMedicalAssistance: boolean;
  readonly medicalPlanNotes: string | null;
  readonly plrEligible: boolean;
  readonly thirteenthPj: boolean;
  readonly guaranteedBonus: number | null;
  readonly commissionPct: number | null;
  readonly bankName: string | null;
  readonly bankBranch: string | null;
  readonly bankAccount: string | null;
  readonly bankAccountType: string | null;
  readonly currentSalary: number | null;
  readonly lastMovementDate: string | null;
  readonly lastMovementType: string | null;
  readonly notes: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
  readonly cltData?: CollaboratorCltData | null;
  readonly pjData?: CollaboratorPjData | null;

  private constructor(props: CollaboratorProps) {
    this.id = props.id;
    this.profileId = props.profileId;
    this.flashEmployeeId = props.flashEmployeeId;
    this.isActive = props.isActive;
    this.registrationNumber = props.registrationNumber;
    this.badgeNumber = props.badgeNumber;
    this.employmentType = props.employmentType;
    this.isInternal = props.isInternal;
    this.fullName = props.fullName;
    this.socialName = props.socialName;
    this.dateOfBirth = props.dateOfBirth;
    this.gender = props.gender;
    this.maritalStatus = props.maritalStatus;
    this.nationality = props.nationality;
    this.cpf = props.cpf;
    this.rg = props.rg;
    this.rgIssuer = props.rgIssuer;
    this.voterRegistration = props.voterRegistration;
    this.voterZone = props.voterZone;
    this.voterSection = props.voterSection;
    this.militaryCert = props.militaryCert;
    this.addressStreet = props.addressStreet;
    this.addressNumber = props.addressNumber;
    this.addressComplement = props.addressComplement;
    this.addressNeighborhood = props.addressNeighborhood;
    this.addressCity = props.addressCity;
    this.addressState = props.addressState;
    this.addressZip = props.addressZip;
    this.phone = props.phone;
    this.personalEmail = props.personalEmail;
    this.corporateEmail = props.corporateEmail;
    this.extension = props.extension;
    this.company = props.company;
    this.directorate = props.directorate;
    this.department = props.department;
    this.branch = props.branch;
    this.managerId = props.managerId;
    this.jobTitle = props.jobTitle;
    this.roleCode = props.roleCode;
    this.roleLevel = props.roleLevel;
    this.startDateOriginal = props.startDateOriginal;
    this.startDateCurrent = props.startDateCurrent;
    this.registrationDate = props.registrationDate;
    this.terminationDate = props.terminationDate;
    this.terminationReason = props.terminationReason;
    this.hasMedicalAssistance = props.hasMedicalAssistance;
    this.medicalPlanNotes = props.medicalPlanNotes;
    this.plrEligible = props.plrEligible;
    this.thirteenthPj = props.thirteenthPj;
    this.guaranteedBonus = props.guaranteedBonus;
    this.commissionPct = props.commissionPct;
    this.bankName = props.bankName;
    this.bankBranch = props.bankBranch;
    this.bankAccount = props.bankAccount;
    this.bankAccountType = props.bankAccountType;
    this.currentSalary = props.currentSalary;
    this.lastMovementDate = props.lastMovementDate;
    this.lastMovementType = props.lastMovementType;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.cltData = props.cltData;
    this.pjData = props.pjData;
  }

  static reconstitute(props: CollaboratorProps): Collaborator {
    return new Collaborator(props);
  }

  get isClt(): boolean {
    return this.employmentType === 'clt';
  }

  get isPj(): boolean {
    return this.employmentType === 'pj';
  }

  /**
   * Returns true if the given field key can be edited by an employee (self-edit).
   */
  static isSelfEditableField(field: string): boolean {
    return SELF_EDITABLE_FIELDS.has(field);
  }

  /**
   * Filters update payload to only allow self-editable fields.
   */
  static filterSelfEditableFields<T extends Record<string, unknown>>(data: T): Partial<T> {
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      if (SELF_EDITABLE_FIELDS.has(key)) {
        filtered[key] = data[key];
      }
    }
    return filtered as Partial<T>;
  }

  /**
   * Strips sensitive fields for people_manager view.
   */
  toManagerView(): Omit<CollaboratorProps, 'currentSalary' | 'bankName' | 'bankBranch' | 'bankAccount' | 'bankAccountType' | 'commissionPct' | 'guaranteedBonus' | 'plrEligible' | 'thirteenthPj' | 'cpf' | 'rg' | 'rgIssuer'> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.toPlainObject())) {
      if (!SENSITIVE_FIELDS.has(key)) {
        result[key] = value;
      }
    }
    return result as ReturnType<Collaborator['toManagerView']>;
  }

  toPlainObject(): CollaboratorProps {
    return {
      id: this.id,
      profileId: this.profileId,
      flashEmployeeId: this.flashEmployeeId,
      isActive: this.isActive,
      registrationNumber: this.registrationNumber,
      badgeNumber: this.badgeNumber,
      employmentType: this.employmentType,
      isInternal: this.isInternal,
      fullName: this.fullName,
      socialName: this.socialName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      maritalStatus: this.maritalStatus,
      nationality: this.nationality,
      cpf: this.cpf,
      rg: this.rg,
      rgIssuer: this.rgIssuer,
      voterRegistration: this.voterRegistration,
      voterZone: this.voterZone,
      voterSection: this.voterSection,
      militaryCert: this.militaryCert,
      addressStreet: this.addressStreet,
      addressNumber: this.addressNumber,
      addressComplement: this.addressComplement,
      addressNeighborhood: this.addressNeighborhood,
      addressCity: this.addressCity,
      addressState: this.addressState,
      addressZip: this.addressZip,
      phone: this.phone,
      personalEmail: this.personalEmail,
      corporateEmail: this.corporateEmail,
      extension: this.extension,
      company: this.company,
      directorate: this.directorate,
      department: this.department,
      branch: this.branch,
      managerId: this.managerId,
      jobTitle: this.jobTitle,
      roleCode: this.roleCode,
      roleLevel: this.roleLevel,
      startDateOriginal: this.startDateOriginal,
      startDateCurrent: this.startDateCurrent,
      registrationDate: this.registrationDate,
      terminationDate: this.terminationDate,
      terminationReason: this.terminationReason,
      hasMedicalAssistance: this.hasMedicalAssistance,
      medicalPlanNotes: this.medicalPlanNotes,
      plrEligible: this.plrEligible,
      thirteenthPj: this.thirteenthPj,
      guaranteedBonus: this.guaranteedBonus,
      commissionPct: this.commissionPct,
      bankName: this.bankName,
      bankBranch: this.bankBranch,
      bankAccount: this.bankAccount,
      bankAccountType: this.bankAccountType,
      currentSalary: this.currentSalary,
      lastMovementDate: this.lastMovementDate,
      lastMovementType: this.lastMovementType,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...(this.cltData ? { cltData: this.cltData } : {}),
      ...(this.pjData ? { pjData: this.pjData } : {}),
    };
  }
}
