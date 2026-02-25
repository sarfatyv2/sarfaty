import { z } from 'zod';
import { uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

// --- Announcements ---

export const createAnnouncementSchema = z.object({
  title: z.string().min(2, 'Title must have at least 2 characters'),
  content: z.string().min(1, 'Content is required'),
  coverImageUrl: z.string().url().optional(),
  targetRoles: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});

export type CreateAnnouncementDto = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = createAnnouncementSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type UpdateAnnouncementDto = z.infer<typeof updateAnnouncementSchema>;

export const listAnnouncementsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
});

export type ListAnnouncementsQueryDto = z.infer<typeof listAnnouncementsQuerySchema>;

// --- Wiki Categories ---

export const createWikiCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  description: z.string().optional(),
  parentId: uuidSchema.optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateWikiCategoryDto = z.infer<typeof createWikiCategorySchema>;

export const updateWikiCategorySchema = createWikiCategorySchema.partial();

export type UpdateWikiCategoryDto = z.infer<typeof updateWikiCategorySchema>;

// --- Wiki Articles ---

export const createWikiArticleSchema = z.object({
  categoryId: uuidSchema,
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  content: z.unknown().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type CreateWikiArticleDto = z.infer<typeof createWikiArticleSchema>;

export const updateWikiArticleSchema = createWikiArticleSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type UpdateWikiArticleDto = z.infer<typeof updateWikiArticleSchema>;

export const listWikiArticlesQuerySchema = paginationQuerySchema.extend({
  categoryId: uuidSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
});

export type ListWikiArticlesQueryDto = z.infer<typeof listWikiArticlesQuerySchema>;
