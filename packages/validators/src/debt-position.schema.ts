import { z } from 'zod';

export const debtPositionRawItemSchema = z.object({
  institution: z.string().nullable(),
  modality: z.string().nullable(),
  guarantee: z.string().nullable(),
  guaranteePercentage: z.number().min(0).max(100).nullable(),
  value: z.number().nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const debtPositionRawExtractionSchema = z.array(debtPositionRawItemSchema);

export type DebtPositionRawItem = z.infer<typeof debtPositionRawItemSchema>;
export type DebtPositionRawExtraction = z.infer<typeof debtPositionRawExtractionSchema>;

export const createDebtPositionSchema = z.object({
  institution: z.string().min(1, 'Instituição é obrigatória'),
  modality: z.string().optional(),
  guarantee: z.string().optional(),
  guaranteePercentage: z.number().min(0).max(100).optional(),
  value: z.number().min(0, 'Valor deve ser positivo'),
  notes: z.string().optional(),
});

export const updateDebtPositionSchema = createDebtPositionSchema.partial();

export type CreateDebtPositionDto = z.infer<typeof createDebtPositionSchema>;
export type UpdateDebtPositionDto = z.infer<typeof updateDebtPositionSchema>;
