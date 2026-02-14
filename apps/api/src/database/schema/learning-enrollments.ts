import { pgTable, uuid, text, integer, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { learningCourses } from './learning-courses';
import { collaborators } from './collaborators';

export const learningEnrollments = pgTable('learning_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => learningCourses.id),
  collaboratorId: uuid('collaborator_id').notNull().references(() => collaborators.id),
  status: text('status').notNull().default('enrolled'),
  progressPct: integer('progress_pct').notNull().default(0),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  deadlineAt: timestamp('deadline_at', { withTimezone: true }),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseIdx: index('idx_learning_enrollments_course').on(table.courseId),
  collaboratorIdx: index('idx_learning_enrollments_collaborator').on(table.collaboratorId),
  statusIdx: index('idx_learning_enrollments_status').on(table.status),
  uniqueEnrollment: unique('uq_learning_enrollment').on(table.courseId, table.collaboratorId),
}));
