import { z } from 'zod';
import { uuidSchema } from './common';

export const pipelineQuerySchema = z.object({
  teamId: uuidSchema.optional(),
  regionId: uuidSchema.optional(),
  segmentId: uuidSchema.optional(),
  periodYear: z.coerce.number().int().optional(),
  periodMonth: z.coerce.number().int().min(1).max(12).optional(),
});

export type PipelineQueryDto = z.infer<typeof pipelineQuerySchema>;
