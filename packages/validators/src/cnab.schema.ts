import { z } from 'zod';
import { uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

export const uploadCnabFileSchema = z.object({
  clientId: uuidSchema,
  bankCode: z.string().min(1, 'Código do banco é obrigatório').max(10),
});

export type UploadCnabFileDto = z.infer<typeof uploadCnabFileSchema>;

export const parseCnabFileSchema = z.object({
  cnabFileId: uuidSchema,
});

export type ParseCnabFileDto = z.infer<typeof parseCnabFileSchema>;

export const listCnabFilesQuerySchema = paginationQuerySchema.extend({
  clientId: uuidSchema.optional(),
  status: z.enum([
    'uploaded',
    'processing',
    'processed',
    'error',
    'partially_processed',
  ]).optional(),
});

export type ListCnabFilesQueryDto = z.infer<typeof listCnabFilesQuerySchema>;

const optionalDate = z.preprocess((v) => (v === '' ? undefined : v), z.string().date().optional());

export const listTradeReceivablesQuerySchema = paginationQuerySchema.extend({
  clientId: uuidSchema.optional(),
  draweeId: uuidSchema.optional(),
  cnabFileId: uuidSchema.optional(),
  operationId: uuidSchema.optional(),
  status: z.enum([
    'pending',
    'registered',
    'paid',
    'overdue',
    'protested',
    'cancelled',
    'written_off',
  ]).optional(),
  evaluationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  dueDateFrom: optionalDate,
  dueDateTo: optionalDate,
});

export type ListTradeReceivablesQueryDto = z.infer<typeof listTradeReceivablesQuerySchema>;

export const listCnabOperationsQuerySchema = paginationQuerySchema.extend({
  clientId: uuidSchema.optional(),
  status: z.enum(['under_evaluation', 'evaluated', 'active']).optional(),
});

export type ListCnabOperationsQueryDto = z.infer<typeof listCnabOperationsQuerySchema>;

export const evaluateReceivableSchema = z
  .object({
    evaluationStatus: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine((data) => data.evaluationStatus !== 'rejected' || (data.rejectionReason && data.rejectionReason.trim().length > 0), {
    message: 'Motivo da rejeição é obrigatório quando a duplicata é rejeitada',
    path: ['rejectionReason'],
  });

export type EvaluateReceivableDto = z.infer<typeof evaluateReceivableSchema>;

export const evaluateReceivableItemSchema = z
  .object({
    receivableId: uuidSchema,
    evaluationStatus: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine((data) => data.evaluationStatus !== 'rejected' || (data.rejectionReason && data.rejectionReason.trim().length > 0), {
    message: 'Motivo da rejeição é obrigatório quando a duplicata é rejeitada',
    path: ['rejectionReason'],
  });

export const batchEvaluateReceivablesSchema = z.object({
  items: z.array(evaluateReceivableItemSchema).min(1).max(200),
});

export type BatchEvaluateReceivablesDto = z.infer<typeof batchEvaluateReceivablesSchema>;
