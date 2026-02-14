import { pgTable, uuid, text, date, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';
import { onboardingTemplates } from './onboarding-templates';
import { profiles } from './profiles';

export const onboardingTasks = pgTable('onboarding_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => onboardingTemplates.id),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => profiles.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_onboarding_tasks_collaborator').on(table.collaboratorId),
  statusIdx: index('idx_onboarding_tasks_status').on(table.status),
  typeIdx: index('idx_onboarding_tasks_type').on(table.type),
}));
