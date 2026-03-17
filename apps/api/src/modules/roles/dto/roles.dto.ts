import { z } from 'zod';

export const createRoleSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, 'key must be lowercase letters, digits, or underscores, starting with a letter'),
  label: z.string().min(2).max(64),
  homeRoute: z.string().min(1),
});

export const updateRoleSchema = z.object({
  label: z.string().min(2).max(64).optional(),
  homeRoute: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const setPermissionsSchema = z.object({
  featureKeys: z.array(z.string()),
});

export const toggleModuleSchema = z.object({
  enabled: z.boolean(),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type SetPermissionsDto = z.infer<typeof setPermissionsSchema>;
export type ToggleModuleDto = z.infer<typeof toggleModuleSchema>;
