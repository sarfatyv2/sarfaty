import { z } from 'zod';
import { cnpjSchema, cpfSchema, dateStringSchema, emailSchema, phoneSchema, uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

// --- Enums ---

const employmentTypeSchema = z.enum(['clt', 'pj']);
const bankAccountTypeSchema = z.enum(['pf', 'pj']);
const genderSchema = z.enum(['masculino', 'feminino', 'outro', 'nao_informado']);
const maritalStatusSchema = z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'outro']);
const relationshipSchema = z.enum([
  'conjuge',
  'filho',
  'filha',
  'pai',
  'mae',
  'enteado',
  'enteada',
  'tutelado',
  'outro',
]);

const ROLE_VALUES = [
  'sales_rep',
  'sales_supervisor',
  'sales_manager',
  'sales_director',
  'credit_analyst',
  'compliance_officer',
  'approver',
  'backoffice',
  'legal',
  'risk_manager',
  'recovery',
  'litigation',
  'employee',
  'people_manager',
  'hr',
  'dp',
  'hr_admin',
  'admin',
] as const;

const UF_VALUES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

// --- Reusable sections ---

const personalDataSection = z.object({
  fullName: z.string().min(2),
  socialName: z.string().optional(),
  dateOfBirth: dateStringSchema.optional(),
  gender: genderSchema.optional(),
  maritalStatus: maritalStatusSchema.optional(),
  nationality: z.string().optional(),
  cpf: cpfSchema.optional(),
  rg: z.string().optional(),
  rgIssuer: z.string().optional(),
  voterRegistration: z.string().optional(),
  voterZone: z.string().optional(),
  voterSection: z.string().optional(),
  militaryCert: z.string().optional(),
});

const addressSection = z.object({
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.enum(UF_VALUES).optional(),
  addressZip: z.string().optional(),
});

const contactSection = z.object({
  phone: phoneSchema.optional(),
  personalEmail: emailSchema.optional(),
  corporateEmail: emailSchema.optional(),
  extension: z.string().optional(),
});

const professionalSection = z.object({
  employmentType: employmentTypeSchema,
  isInternal: z.boolean().default(true),
  registrationNumber: z.string().optional(),
  badgeNumber: z.string().optional(),
  company: z.string().default('Sarfaty'),
  directorate: z.string().optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  managerId: z.union([uuidSchema, z.literal('')]).transform(v => v === '' ? undefined : v).optional(),
  jobTitle: z.string().optional(),
  roleCode: z.string().optional(),
  roleLevel: z.string().optional(),
  startDateOriginal: dateStringSchema.optional(),
  startDateCurrent: dateStringSchema.optional(),
  registrationDate: dateStringSchema.optional(),
});

const financialSection = z.object({
  currentSalary: z.coerce.number().nonnegative().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountType: bankAccountTypeSchema.optional(),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  guaranteedBonus: z.coerce.number().nonnegative().optional(),
  plrEligible: z.boolean().default(false),
  thirteenthPj: z.boolean().default(false),
});

const benefitsSection = z.object({
  hasMedicalAssistance: z.boolean().default(true),
  medicalPlanNotes: z.string().optional(),
});

const cltDataSection = z.object({
  ctpsNumber: z.string().optional(),
  ctpsSeries: z.string().optional(),
  pisPasep: z.string().optional(),
  timesheetSystem: z.string().optional(),
  timesheetId: z.string().optional(),
});

const pjDataSection = z.object({
  companyName: z.string().optional(),
  companyCnpj: cnpjSchema.optional(),
  companyCnae: z.string().optional(),
  monthlyNfAmount: z.coerce.number().nonnegative().optional(),
  nfDueDay: z.coerce.number().int().min(1).max(31).optional(),
});

// --- Create Collaborator (HR/DP/Admin use) ---

export const createCollaboratorSchema = personalDataSection
  .merge(addressSection)
  .merge(contactSection)
  .merge(professionalSection)
  .merge(financialSection)
  .merge(benefitsSection);

export type CreateCollaboratorDto = z.infer<typeof createCollaboratorSchema>;

// --- Update Collaborator — Employee self-edit (restricted fields) ---

export const updateCollaboratorSelfSchema = z.object({
  socialName: z.string().optional(),
  phone: phoneSchema.optional(),
  personalEmail: emailSchema.optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.enum(UF_VALUES).optional(),
  addressZip: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountType: bankAccountTypeSchema.optional(),
});

export type UpdateCollaboratorSelfDto = z.infer<typeof updateCollaboratorSelfSchema>;

// --- Update Collaborator — Admin/HR/DP (all fields) ---

export const updateCollaboratorAdminSchema = personalDataSection.partial()
  .merge(addressSection.partial())
  .merge(contactSection.partial())
  .merge(professionalSection.partial())
  .merge(financialSection.partial())
  .merge(benefitsSection.partial())
  .merge(cltDataSection.partial())
  .merge(pjDataSection.partial())
  .extend({
    isActive: z.boolean().optional(),
    terminationDate: dateStringSchema.optional(),
    terminationReason: z.string().optional(),
    notes: z.string().optional(),
    role: z.enum(ROLE_VALUES).optional(),
  });

export type UpdateCollaboratorAdminDto = z.infer<typeof updateCollaboratorAdminSchema>;

// --- List Collaborators Query ---

export const listCollaboratorsQuerySchema = paginationQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
  employmentType: employmentTypeSchema.optional(),
  department: z.string().optional(),
  directorate: z.string().optional(),
  search: z.string().optional(),
  managerId: uuidSchema.optional(),
});

export type ListCollaboratorsQueryDto = z.infer<typeof listCollaboratorsQuerySchema>;

// --- Dependent Schemas ---

export const createDependentSchema = z.object({
  fullName: z.string().min(2),
  relationship: relationshipSchema,
  dateOfBirth: dateStringSchema.optional(),
  cpf: cpfSchema.optional(),
  isIrDependent: z.boolean().default(false),
  isHealthPlan: z.boolean().default(false),
  notes: z.string().optional(),
});

export type CreateDependentDto = z.infer<typeof createDependentSchema>;

export const updateDependentSchema = createDependentSchema.partial();

export type UpdateDependentDto = z.infer<typeof updateDependentSchema>;
