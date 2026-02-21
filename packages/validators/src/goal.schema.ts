import { z } from 'zod';
import { paginationQuerySchema } from './pagination.schema';
import { uuidSchema } from './common';

export const createGoalSchema = z
  .object({
    level: z.enum(['individual', 'team', 'region']),
    profileId: uuidSchema.optional(),
    teamId: uuidSchema.optional(),
    regionId: uuidSchema.optional(),
    periodYear: z.coerce.number().int().min(2024).max(2100),
    periodMonth: z.coerce.number().int().min(1).max(12),
    goalAmount: z.coerce.number().positive(),
    goalCount: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.level === 'individual') return !!data.profileId;
      if (data.level === 'team') return !!data.teamId;
      if (data.level === 'region') return !!data.regionId;
      return false;
    },
    { message: 'Target ID must match the selected level' },
  );

export type CreateGoalDto = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  goalAmount: z.coerce.number().positive().optional(),
  goalCount: z.coerce.number().int().positive().nullable().optional(),
});

export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;

export const listGoalsQuerySchema = paginationQuerySchema.extend({
  level: z.enum(['individual', 'team', 'region']).optional(),
  periodYear: z.coerce.number().int().optional(),
  periodMonth: z.coerce.number().int().min(1).max(12).optional(),
  teamId: uuidSchema.optional(),
  regionId: uuidSchema.optional(),
});

export type ListGoalsQueryDto = z.infer<typeof listGoalsQuerySchema>;
