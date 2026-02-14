import { pgTable, uuid, integer, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { learningEnrollments } from './learning-enrollments';
import { learningLessons } from './learning-lessons';

export const learningLessonCompletions = pgTable('learning_lesson_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').notNull().references(() => learningEnrollments.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => learningLessons.id),
  watchedPct: integer('watched_pct').notNull().default(0),
  quizScore: integer('quiz_score'),
  quizPassed: boolean('quiz_passed'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  enrollmentIdx: index('idx_lesson_completions_enrollment').on(table.enrollmentId),
  lessonIdx: index('idx_lesson_completions_lesson').on(table.lessonId),
  uniqueCompletion: unique('uq_lesson_completion').on(table.enrollmentId, table.lessonId),
}));
