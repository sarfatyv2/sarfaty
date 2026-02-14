import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const learningCourses = pgTable('learning_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').notNull(),
  targetRoles: text('target_roles').array().notNull(),
  isMandatory: boolean('is_mandatory').default(false),
  deadlineDays: integer('deadline_days'),
  status: text('status').notNull().default('draft'),
  totalDurationSeconds: integer('total_duration_seconds').default(0),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  statusIdx: index('idx_learning_courses_status').on(table.status),
  categoryIdx: index('idx_learning_courses_category').on(table.category),
  createdIdx: index('idx_learning_courses_created').on(table.createdAt),
}));
