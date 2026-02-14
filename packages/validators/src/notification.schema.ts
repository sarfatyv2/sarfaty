import { z } from 'zod';
import { paginationQuerySchema } from './pagination.schema';

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z.coerce.boolean().optional(),
});

export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>;
