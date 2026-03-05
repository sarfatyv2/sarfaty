import { z } from 'zod';
import { cpfSchema, cnpjSchema, uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

export const createDraweeSchema = z.object({
  personType: z.enum(['individual', 'company']).default('company'),
  companyName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tradeName: z.string().optional(),
  legalName: z.string().optional(),
  cnpj: cnpjSchema.optional(),
  cpf: cpfSchema.optional(),
  rg: z.string().max(30).optional(),
  birthDate: z.string().date().optional(),
  gender: z.enum(['M', 'F', 'other']).optional(),
  isPep: z.boolean().default(false),
  isOfacListed: z.boolean().default(false),
  segmentId: uuidSchema.optional(),
  economicGroupId: uuidSchema.optional(),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
}).superRefine((data, ctx) => {
  if (data.personType === 'company' && !data.cnpj) {
    ctx.addIssue({ code: 'custom', path: ['cnpj'], message: 'CNPJ é obrigatório para pessoa jurídica' });
  }
  if (data.personType === 'individual' && !data.cpf) {
    ctx.addIssue({ code: 'custom', path: ['cpf'], message: 'CPF é obrigatório para pessoa física' });
  }
});

export type CreateDraweeDto = z.infer<typeof createDraweeSchema>;

export const updateDraweeSchema = z.object({
  companyName: z.string().min(2).optional(),
  tradeName: z.string().optional(),
  legalName: z.string().optional(),
  rg: z.string().max(30).optional(),
  birthDate: z.string().date().optional(),
  gender: z.enum(['M', 'F', 'other']).optional(),
  isPep: z.boolean().optional(),
  isOfacListed: z.boolean().optional(),
  riskRating: z.string().optional(),
  creditScore: z.number().int().optional(),
  segmentId: uuidSchema.optional(),
  economicGroupId: uuidSchema.optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  blockReason: z.string().optional(),
});

export type UpdateDraweeDto = z.infer<typeof updateDraweeSchema>;

export const listDraweesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  personType: z.enum(['individual', 'company']).optional(),
  segmentId: uuidSchema.optional(),
  isPep: z.coerce.boolean().optional(),
});

export type ListDraweesQueryDto = z.infer<typeof listDraweesQuerySchema>;

// --- Drawee Contacts ---
export const createDraweeContactSchema = z.object({
  contactName: z.string().min(1).optional(),
  useType: z.enum(['commercial', 'financial', 'operational', 'billing']).optional(),
  email: z.string().email().optional(),
  emailSecondary: z.string().email().optional(),
  billingEmail: z.string().email().optional(),
  xmlEmail: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  phoneMobile: z.string().max(20).optional(),
  phoneSms: z.string().max(20).optional(),
  billingPhone: z.string().max(20).optional(),
  whatsapp: z.boolean().default(false),
  homepage: z.string().url().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateDraweeContactSchema = createDraweeContactSchema.partial();

export type CreateDraweeContactDto = z.infer<typeof createDraweeContactSchema>;
export type UpdateDraweeContactDto = z.infer<typeof updateDraweeContactSchema>;

// --- Drawee Addresses ---
export const createDraweeAddressSchema = z.object({
  useType: z.enum(['commercial', 'fiscal', 'correspondence', 'billing']).optional(),
  street: z.string().max(255).optional(),
  number: z.string().max(20).optional(),
  withoutNumber: z.boolean().default(false),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  zipCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateDraweeAddressSchema = createDraweeAddressSchema.partial();

export type CreateDraweeAddressDto = z.infer<typeof createDraweeAddressSchema>;
export type UpdateDraweeAddressDto = z.infer<typeof updateDraweeAddressSchema>;

// --- Drawee Bank Accounts ---
export const createDraweeBankAccountSchema = z.object({
  bankCode: z.string().max(10).optional(),
  bankName: z.string().max(100).optional(),
  branch: z.string().max(20).optional(),
  accountNumber: z.string().max(30).optional(),
  accountType: z.enum(['checking', 'savings', 'payment']).optional(),
  pixKey: z.string().max(150).optional(),
  nickname: z.string().max(50).optional(),
  openedAt: z.string().date().optional(),
  status: z.enum(['active', 'closed', 'blocked']).default('active'),
  isPrimary: z.boolean().default(false),
});

export const updateDraweeBankAccountSchema = createDraweeBankAccountSchema.partial();

export type CreateDraweeBankAccountDto = z.infer<typeof createDraweeBankAccountSchema>;
export type UpdateDraweeBankAccountDto = z.infer<typeof updateDraweeBankAccountSchema>;

// --- Drawee Authorized Persons (Sócios) ---
export const createDraweeAuthorizedPersonSchema = z.object({
  authorizationType: z.enum(['partner', 'administrator', 'attorney', 'legal_representative', 'authorized']).optional(),
  fullName: z.string().min(2),
  cpf: cpfSchema.optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
});

export const updateDraweeAuthorizedPersonSchema = createDraweeAuthorizedPersonSchema.partial().extend({
  fullName: z.string().min(2).optional(),
});

export type CreateDraweeAuthorizedPersonDto = z.infer<typeof createDraweeAuthorizedPersonSchema>;
export type UpdateDraweeAuthorizedPersonDto = z.infer<typeof updateDraweeAuthorizedPersonSchema>;
