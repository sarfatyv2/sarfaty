import { pgTable, uuid, text, integer, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { learningModules } from './learning-modules';

export const learningLessons = pgTable('learning_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  youtubeVideoId: text('youtube_video_id').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  materials: jsonb('materials'),
  quiz: jsonb('quiz'),
  minQuizScore: integer('min_quiz_score').default(70),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  moduleIdx: index('idx_learning_lessons_module').on(table.moduleId),
}));
