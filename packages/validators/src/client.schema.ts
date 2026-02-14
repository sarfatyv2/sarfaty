import { z } from 'zod';
import { cnpjSchema, uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

// Step 1: Basic client data
export const createClientSchema = z.object({
  companyName: z.string().min(2, 'Razão social deve ter pelo menos 2 caracteres'),
  cnpj: cnpjSchema,
  tradeName: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido').max(15),
  email: z.string().email('Email inválido'),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().max(2).optional(),
  addressZip: z.string().optional(),
  segmentId: uuidSchema,
  creditProductId: uuidSchema,
  requestedAmount: z.coerce.number().positive('Valor pretendido deve ser positivo').optional(),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;

// Step 2: Operation configuration (update)
export const updateClientSchema = z.object({
  companyName: z.string().min(2).optional(),
  tradeName: z.string().optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().max(2).optional(),
  addressZip: z.string().optional(),
  segmentId: uuidSchema.optional(),
  creditProductId: uuidSchema.optional(),
  requestedAmount: z.coerce.number().positive().optional(),
  hasGuarantees: z.boolean().optional(),
  isJudicialRecovery: z.boolean().optional(),
  workingCapitalNotes: z.any().optional(),
  guarantees: z.array(z.object({
    guaranteeTypeId: uuidSchema,
    description: z.string().optional(),
    estimatedValue: z.coerce.number().positive().optional(),
  })).optional(),
});

export type UpdateClientDto = z.infer<typeof updateClientSchema>;

// Document upload metadata
export const uploadDocumentSchema = z.object({
  documentType: z.string().min(1),
  documentCategory: z.enum(['base', 'segment', 'product', 'guarantee', 'conditional', 'partner']),
  documentLabel: z.string().optional(),
  referenceYear: z.coerce.number().int().min(2020).max(2030).optional(),
  referenceMonth: z.coerce.number().int().min(1).max(12).optional(),
  partnerName: z.string().optional(),
  segmentTemplateId: uuidSchema.optional(),
  productTemplateId: uuidSchema.optional(),
  guaranteeTemplateId: uuidSchema.optional(),
  clientGuaranteeId: uuidSchema.optional(),
});

export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;

// Client list query
export const listClientsQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  segmentId: uuidSchema.optional(),
  search: z.string().optional(),
  assignedTo: uuidSchema.optional(),
});

export type ListClientsQueryDto = z.infer<typeof listClientsQuerySchema>;
