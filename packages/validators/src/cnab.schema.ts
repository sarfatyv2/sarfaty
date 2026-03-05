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
  status: z.enum([
    'pending',
    'registered',
    'paid',
    'overdue',
    'protested',
    'cancelled',
    'written_off',
  ]).optional(),
  dueDateFrom: optionalDate,
  dueDateTo: optionalDate,
});

export type ListTradeReceivablesQueryDto = z.infer<typeof listTradeReceivablesQuerySchema>;
