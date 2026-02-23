import { z } from 'zod';
import { paginationQuerySchema } from './pagination.schema';

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  actorId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
});

export type ListAuditLogsQueryDto = z.infer<typeof listAuditLogsQuerySchema>;
