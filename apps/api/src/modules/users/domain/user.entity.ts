import { type Role, ROLES } from '@nexus/types';

export interface CreateUserProps {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  // Collaborator fields
  employmentType?: 'clt' | 'pj';
  isInternal?: boolean;
  socialName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string;
  cpf?: string | null;
  rg?: string | null;
  rgIssuer?: string | null;
  voterRegistration?: string | null;
  voterZone?: string | null;
  voterSection?: string | null;
  militaryCert?: string | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZip?: string | null;
  personalEmail?: string | null;
  corporateEmail?: string | null;
  extension?: string | null;
  company?: string;
  directorate?: string | null;
  department?: string | null;
  branch?: string | null;
  managerId?: string | null;
  jobTitle?: string | null;
  roleCode?: string | null;
  roleLevel?: string | null;
  startDateOriginal?: string | null;
  startDateCurrent?: string | null;
  registrationDate?: string | null;
  registrationNumber?: string | null;
  badgeNumber?: string | null;
  currentSalary?: number | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccount?: string | null;
  bankAccountType?: 'pf' | 'pj' | null;
  commissionPct?: number | null;
  guaranteedBonus?: number | null;
  plrEligible?: boolean;
  thirteenthPj?: boolean;
  hasMedicalAssistance?: boolean;
  medicalPlanNotes?: string | null;
  // CLT-specific
  ctpsNumber?: string | null;
  ctpsSeries?: string | null;
  pisPasep?: string | null;
  timesheetSystem?: string;
  timesheetId?: string | null;
  // PJ-specific
  companyName?: string | null;
  companyCnpj?: string | null;
  companyCnae?: string | null;
  monthlyNfAmount?: number | null;
  nfDueDay?: number;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: Role;
  readonly phone: string | null;
  readonly employmentType: 'clt' | 'pj' | undefined;
  readonly isInternal: boolean;
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
  readonly registrationNumber: string | null;
  readonly badgeNumber: string | null;
  readonly currentSalary: number | null;
  readonly bankName: string | null;
  readonly bankBranch: string | null;
  readonly bankAccount: string | null;
  readonly bankAccountType: 'pf' | 'pj' | null;
  readonly commissionPct: number | null;
  readonly guaranteedBonus: number | null;
  readonly plrEligible: boolean;
  readonly thirteenthPj: boolean;
  readonly hasMedicalAssistance: boolean;
  readonly medicalPlanNotes: string | null;
  readonly ctpsNumber: string | null;
  readonly ctpsSeries: string | null;
  readonly pisPasep: string | null;
  readonly timesheetSystem: string;
  readonly timesheetId: string | null;
  readonly companyName: string | null;
  readonly companyCnpj: string | null;
  readonly companyCnae: string | null;
  readonly monthlyNfAmount: number | null;
  readonly nfDueDay: number;
  readonly isActive: boolean;
  readonly createdAt: string | null;

  private constructor(props: CreateUserProps & { isActive?: boolean; createdAt?: string | null }) {
    this.id = props.id;
    this.email = props.email;
    this.fullName = props.fullName;
    this.role = props.role;
    this.phone = props.phone ?? null;
    this.employmentType = props.employmentType;
    this.isInternal = props.isInternal ?? true;
    this.socialName = props.socialName ?? null;
    this.dateOfBirth = props.dateOfBirth ?? null;
    this.gender = props.gender ?? null;
    this.maritalStatus = props.maritalStatus ?? null;
    this.nationality = props.nationality ?? 'Brasileira';
    this.cpf = props.cpf ?? null;
    this.rg = props.rg ?? null;
    this.rgIssuer = props.rgIssuer ?? null;
    this.voterRegistration = props.voterRegistration ?? null;
    this.voterZone = props.voterZone ?? null;
    this.voterSection = props.voterSection ?? null;
    this.militaryCert = props.militaryCert ?? null;
    this.addressStreet = props.addressStreet ?? null;
    this.addressNumber = props.addressNumber ?? null;
    this.addressComplement = props.addressComplement ?? null;
    this.addressNeighborhood = props.addressNeighborhood ?? null;
    this.addressCity = props.addressCity ?? null;
    this.addressState = props.addressState ?? null;
    this.addressZip = props.addressZip ?? null;
    this.personalEmail = props.personalEmail ?? null;
    this.corporateEmail = props.corporateEmail ?? null;
    this.extension = props.extension ?? null;
    this.company = props.company ?? 'Sarfaty';
    this.directorate = props.directorate ?? null;
    this.department = props.department ?? null;
    this.branch = props.branch ?? null;
    this.managerId = props.managerId ?? null;
    this.jobTitle = props.jobTitle ?? null;
    this.roleCode = props.roleCode ?? null;
    this.roleLevel = props.roleLevel ?? null;
    this.startDateOriginal = props.startDateOriginal ?? null;
    this.startDateCurrent = props.startDateCurrent ?? null;
    this.registrationDate = props.registrationDate ?? null;
    this.registrationNumber = props.registrationNumber ?? null;
    this.badgeNumber = props.badgeNumber ?? null;
    this.currentSalary = props.currentSalary ?? null;
    this.bankName = props.bankName ?? null;
    this.bankBranch = props.bankBranch ?? null;
    this.bankAccount = props.bankAccount ?? null;
    this.bankAccountType = props.bankAccountType ?? null;
    this.commissionPct = props.commissionPct ?? null;
    this.guaranteedBonus = props.guaranteedBonus ?? null;
    this.plrEligible = props.plrEligible ?? false;
    this.thirteenthPj = props.thirteenthPj ?? false;
    this.hasMedicalAssistance = props.hasMedicalAssistance ?? true;
    this.medicalPlanNotes = props.medicalPlanNotes ?? null;
    this.ctpsNumber = props.ctpsNumber ?? null;
    this.ctpsSeries = props.ctpsSeries ?? null;
    this.pisPasep = props.pisPasep ?? null;
    this.timesheetSystem = props.timesheetSystem ?? 'ponto_mais';
    this.timesheetId = props.timesheetId ?? null;
    this.companyName = props.companyName ?? null;
    this.companyCnpj = props.companyCnpj ?? null;
    this.companyCnae = props.companyCnae ?? null;
    this.monthlyNfAmount = props.monthlyNfAmount ?? null;
    this.nfDueDay = props.nfDueDay ?? 25;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? null;
  }

  static create(props: CreateUserProps): User {
    User.validateRole(props.role);
    User.validateEmail(props.email);
    User.validateFullName(props.fullName);

    return new User(props);
  }

  static reconstitute(props: CreateUserProps & { isActive?: boolean; createdAt?: string | null }): User {
    return new User(props);
  }

  get hasCollaboratorData(): boolean {
    return this.employmentType !== undefined;
  }

  get isClt(): boolean {
    return this.employmentType === 'clt';
  }

  get isPj(): boolean {
    return this.employmentType === 'pj';
  }

  private static validateRole(role: string): void {
    if (!ROLES.includes(role as Role)) {
      throw new Error(`Invalid role: ${role}`);
    }
  }

  private static validateEmail(email: string): void {
    if (!email?.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  private static validateFullName(fullName: string): void {
    if ((fullName?.trim().length ?? 0) < 2) {
      throw new Error('Full name must have at least 2 characters');
    }
  }
}
