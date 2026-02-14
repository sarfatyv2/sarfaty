import { z } from 'zod';

export const listInvoicesQuerySchema = z.object({
  status: z.string().optional(),
  referenceYear: z.coerce.number().min(2000).max(2100).optional(),
  referenceMonth: z.coerce.number().min(1).max(12).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});
export type ListInvoicesQueryDto = z.infer<typeof listInvoicesQuerySchema>;

export const rejectInvoiceSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});
export type RejectInvoiceDto = z.infer<typeof rejectInvoiceSchema>;

export const payInvoiceSchema = z.object({
  paymentReference: z.string().optional(),
});
export type PayInvoiceDto = z.infer<typeof payInvoiceSchema>;
