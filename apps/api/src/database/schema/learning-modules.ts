import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { learningCourses } from './learning-courses';

export const learningModules = pgTable('learning_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => learningCourses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseIdx: index('idx_learning_modules_course').on(table.courseId),
}));
