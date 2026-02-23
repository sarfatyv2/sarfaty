import { z } from 'zod';
import {
  emailSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  uuidSchema,
  dateStringSchema,
} from './common';
import { paginationQuerySchema } from './pagination.schema';

const ROLES = [
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
  'governance',
  'admin',
] as const;

const UF_VALUES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

const employmentTypeSchema = z.enum(['clt', 'pj']);
const bankAccountTypeSchema = z.enum(['pf', 'pj']);

// --- Section schemas (composable) ---

const accessSectionSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(ROLES),
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

const personalDataSectionSchema = z.object({
  socialName: z.string().optional(),
  dateOfBirth: dateStringSchema.optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().default('Brasileira'),
  cpf: cpfSchema.optional(),
  rg: z.string().optional(),
  rgIssuer: z.string().optional(),
  voterRegistration: z.string().optional(),
  voterZone: z.string().optional(),
  voterSection: z.string().optional(),
  militaryCert: z.string().optional(),
});

const addressSectionSchema = z.object({
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.enum(UF_VALUES).optional(),
  addressZip: z.string().optional(),
});

const contactSectionSchema = z.object({
  phone: phoneSchema.optional(),
  personalEmail: emailSchema.optional(),
  corporateEmail: emailSchema.optional(),
  extension: z.string().optional(),
});

const professionalSectionSchema = z.object({
  employmentType: employmentTypeSchema,
  isInternal: z.boolean().default(true),
  registrationNumber: z.string().optional(),
  badgeNumber: z.string().optional(),
  company: z.string().default('Sarfaty'),
  directorate: z.string().optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  jobTitle: z.string().optional(),
  roleCode: z.string().optional(),
  roleLevel: z.string().optional(),
  startDateOriginal: dateStringSchema.optional(),
  startDateCurrent: dateStringSchema.optional(),
  registrationDate: dateStringSchema.optional(),
  managerId: z.union([uuidSchema, z.literal('')]).transform(v => v === '' ? undefined : v).optional(),
});

const financialSectionSchema = z.object({
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

const benefitsSectionSchema = z.object({
  hasMedicalAssistance: z.boolean().default(true),
  medicalPlanNotes: z.string().optional(),
});

const cltDataSectionSchema = z.object({
  ctpsNumber: z.string().optional(),
  ctpsSeries: z.string().optional(),
  pisPasep: z.string().optional(),
  timesheetSystem: z.string().default('ponto_mais'),
  timesheetId: z.string().optional(),
});

const pjDataSectionSchema = z.object({
  companyName: z.string().optional(),
  companyCnpj: cnpjSchema.optional(),
  companyCnae: z.string().optional(),
  monthlyNfAmount: z.coerce.number().nonnegative().optional(),
  nfDueDay: z.coerce.number().int().min(1).max(31).default(25),
});

// --- Main schema ---

export const createUserSchema = accessSectionSchema
  .merge(personalDataSectionSchema)
  .merge(addressSectionSchema)
  .merge(contactSectionSchema)
  .merge(professionalSectionSchema)
  .merge(financialSectionSchema)
  .merge(benefitsSectionSchema)
  .merge(cltDataSectionSchema.partial())
  .merge(pjDataSectionSchema.partial())
  .superRefine((data, ctx) => {
    if (data.employmentType === 'clt') {
      const ctps = data.ctpsNumber;
      if (typeof ctps === 'string' && ctps.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CTPS é recomendado para colaboradores CLT',
          path: ['ctpsNumber'],
        });
      }
    }

    if (data.employmentType === 'pj') {
      const cnpj = data.companyCnpj;
      if (typeof cnpj === 'string' && cnpj.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CNPJ da empresa é recomendado para colaboradores PJ',
          path: ['companyCnpj'],
        });
      }
    }
  });

export type CreateUserDto = z.infer<typeof createUserSchema>;

// --- List users query schema ---

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
