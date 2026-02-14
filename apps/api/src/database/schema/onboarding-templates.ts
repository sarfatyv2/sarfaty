import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const onboardingTemplates = pgTable('onboarding_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  employmentType: text('employment_type'),
  taskOrder: integer('task_order').notNull(),
  taskTitle: text('task_title').notNull(),
  taskDescription: text('task_description'),
  responsibleArea: text('responsible_area').notNull(),
  dueDays: integer('due_days'),
  isRequired: boolean('is_required').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
