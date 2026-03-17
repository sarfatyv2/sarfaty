import { z } from 'zod';
import { uuidSchema, cpfSchema, cnpjSchema } from './common';

// --- Contacts ---
export const createClientContactSchema = z.object({
  contactName: z.string().min(1).optional(),
  useType: z.enum(['commercial', 'financial', 'operational', 'billing']).optional(),
  email: z.string().email().optional(),
  emailSecondary: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  phoneMobile: z.string().max(20).optional(),
  phoneSms: z.string().max(20).optional(),
  whatsapp: z.boolean().default(false),
  homepage: z.string().url().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateClientContactSchema = createClientContactSchema.partial();

export type CreateClientContactDto = z.infer<typeof createClientContactSchema>;
export type UpdateClientContactDto = z.infer<typeof updateClientContactSchema>;

// --- Addresses ---
export const createClientAddressSchema = z.object({
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

export const updateClientAddressSchema = createClientAddressSchema.partial();

export type CreateClientAddressDto = z.infer<typeof createClientAddressSchema>;
export type UpdateClientAddressDto = z.infer<typeof updateClientAddressSchema>;

// --- Bank Accounts ---
export const createClientBankAccountSchema = z.object({
  bankCode: z.string().max(10).optional(),
  bankName: z.string().max(100).optional(),
  branch: z.string().max(20).optional(),
  accountNumber: z.string().max(30).optional(),
  accountType: z.enum(['checking', 'savings', 'payment']).optional(),
  pixKey: z.string().max(150).optional(),
  nickname: z.string().max(50).optional(),
  openedAt: z.string().date().optional(),
  closedAt: z.string().date().optional(),
  status: z.enum(['active', 'closed', 'blocked']).default('active'),
  isPrimary: z.boolean().default(false),
});

export const updateClientBankAccountSchema = createClientBankAccountSchema.partial();

export type CreateClientBankAccountDto = z.infer<typeof createClientBankAccountSchema>;
export type UpdateClientBankAccountDto = z.infer<typeof updateClientBankAccountSchema>;

// --- Authorized Persons ---
export const createClientAuthorizedPersonSchema = z.discriminatedUnion('personType', [
  z.object({
    personType: z.literal('pf'),
    authorizationType: z.enum(['partner', 'attorney', 'legal_representative', 'authorized']).optional(),
    fullName: z.string().min(2),
    cpf: cpfSchema.optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().default(true),
  }),
  z.object({
    personType: z.literal('pj'),
    authorizationType: z.enum(['partner', 'attorney', 'legal_representative', 'authorized']).optional(),
    fullName: z.string().min(2),
    cnpj: cnpjSchema,
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().default(true),
  }),
]).default({ personType: 'pf', fullName: '' } as never);

export const updateClientAuthorizedPersonSchema = z.object({
  personType: z.enum(['pf', 'pj']).optional(),
  authorizationType: z.enum(['partner', 'attorney', 'legal_representative', 'authorized']).optional(),
  fullName: z.string().min(2).optional(),
  cpf: cpfSchema.optional(),
  cnpj: cnpjSchema.optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export type CreateClientAuthorizedPersonDto = z.infer<typeof createClientAuthorizedPersonSchema>;
export type UpdateClientAuthorizedPersonDto = z.infer<typeof updateClientAuthorizedPersonSchema>;

// Re-export param schema
export const subResourceParamSchema = z.object({ id: uuidSchema, subId: uuidSchema });
