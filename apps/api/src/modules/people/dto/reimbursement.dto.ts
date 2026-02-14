import { z } from 'zod';
import { REIMBURSEMENT_CATEGORIES } from '@nexus/utils';

export const createReimbursementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(REIMBURSEMENT_CATEGORIES as unknown as [string, ...string[]]),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
export type CreateReimbursementDto = z.infer<typeof createReimbursementSchema>;

export const updateReimbursementSchema = createReimbursementSchema.partial();
export type UpdateReimbursementDto = z.infer<typeof updateReimbursementSchema>;

export const listReimbursementsQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});
export type ListReimbursementsQueryDto = z.infer<typeof listReimbursementsQuerySchema>;

export const rejectReimbursementSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});
export type RejectReimbursementDto = z.infer<typeof rejectReimbursementSchema>;

export const payReimbursementSchema = z.object({
  paymentReference: z.string().optional(),
});
export type PayReimbursementDto = z.infer<typeof payReimbursementSchema>;
