import { z } from 'zod';
import { uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

// --- Committees ---

export const createCommitteeSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  description: z.string().optional(),
  regulation: z.string().optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'adhoc']).default('monthly'),
});

export type CreateCommitteeDto = z.infer<typeof createCommitteeSchema>;

export const updateCommitteeSchema = createCommitteeSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateCommitteeDto = z.infer<typeof updateCommitteeSchema>;

export const listCommitteesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

export type ListCommitteesQueryDto = z.infer<typeof listCommitteesQuerySchema>;

// --- Committee Members ---

export const inviteMemberSchema = z.object({
  profileId: uuidSchema,
  role: z.enum(['president', 'secretary', 'member']).default('member'),
});

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['president', 'secretary', 'member']),
});

export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;

// --- Meetings ---

export const createMeetingSchema = z.object({
  title: z.string().min(2, 'Title must have at least 2 characters'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime({ message: 'Invalid datetime format' }),
  locationOrLink: z.string().optional(),
});

export type CreateMeetingDto = z.infer<typeof createMeetingSchema>;

export const updateMeetingSchema = createMeetingSchema.partial().extend({
  status: z.enum(['scheduled', 'happening', 'completed', 'canceled']).optional(),
});

export type UpdateMeetingDto = z.infer<typeof updateMeetingSchema>;

export const listMeetingsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['scheduled', 'happening', 'completed', 'canceled']).optional(),
});

export type ListMeetingsQueryDto = z.infer<typeof listMeetingsQuerySchema>;

// --- Meeting Minutes ---

export const upsertMinuteSchema = z.object({
  content: z.unknown().optional(),
});

export type UpsertMinuteDto = z.infer<typeof upsertMinuteSchema>;

// --- Action Items ---

export const createActionItemSchema = z.object({
  title: z.string().min(2, 'Title must have at least 2 characters'),
  description: z.string().optional(),
  assigneeId: uuidSchema.optional(),
  groupLabel: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  minuteId: uuidSchema.optional(),
});

export type CreateActionItemDto = z.infer<typeof createActionItemSchema>;

export const updateActionItemSchema = createActionItemSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']).optional(),
});

export type UpdateActionItemDto = z.infer<typeof updateActionItemSchema>;

export const listActionItemsQuerySchema = paginationQuerySchema.extend({
  committeeId: uuidSchema.optional(),
  assigneeId: uuidSchema.optional(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']).optional(),
});

export type ListActionItemsQueryDto = z.infer<typeof listActionItemsQuerySchema>;

// --- Action Updates ---

export const createActionUpdateSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
  statusChange: z.enum(['todo', 'in_progress', 'blocked', 'done']).optional(),
});

export type CreateActionUpdateDto = z.infer<typeof createActionUpdateSchema>;
