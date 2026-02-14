import { pgTable, uuid, text, numeric, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { performanceReviewCycles } from './performance-review-cycles';
import { collaborators } from './collaborators';
import { profiles } from './profiles';

export const performanceReviews = pgTable('performance_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  cycleId: uuid('cycle_id').references(() => performanceReviewCycles.id),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id),
  reviewerId: uuid('reviewer_id').references(() => collaborators.id),
  selfReviewScore: numeric('self_review_score', { precision: 3, scale: 1 }),
  selfReviewText: text('self_review_text'),
  selfReviewSubmittedAt: timestamp('self_review_submitted_at', { withTimezone: true }),
  managerReviewScore: numeric('manager_review_score', { precision: 3, scale: 1 }),
  managerReviewText: text('manager_review_text'),
  managerReviewSubmittedAt: timestamp('manager_review_submitted_at', { withTimezone: true }),
  calibratedScore: numeric('calibrated_score', { precision: 3, scale: 1 }),
  calibrationNotes: text('calibration_notes'),
  calibratedBy: uuid('calibrated_by').references(() => profiles.id),
  calibratedAt: timestamp('calibrated_at', { withTimezone: true }),
  finalScore: numeric('final_score', { precision: 3, scale: 1 }),
  finalRating: text('final_rating'),
  developmentPlan: text('development_plan'),
  goalsNextCycle: text('goals_next_cycle'),
  status: text('status').notNull().default('pending'),
  feedbackGivenAt: timestamp('feedback_given_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  cycleCollaboratorUniq: unique('uq_performance_reviews_cycle_collaborator').on(table.cycleId, table.collaboratorId),
  collaboratorIdx: index('idx_performance_reviews_collaborator').on(table.collaboratorId),
  cycleIdx: index('idx_performance_reviews_cycle').on(table.cycleId),
  statusIdx: index('idx_performance_reviews_status').on(table.status),
  reviewerIdx: index('idx_performance_reviews_reviewer').on(table.reviewerId),
}));
