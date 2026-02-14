import { pgTable, uuid, text, boolean, date, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';

export const collaboratorDependents = pgTable('collaborator_dependents', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id, { onDelete: 'cascade' }),
  relationship: text('relationship'),
  fullName: text('full_name').notNull(),
  dateOfBirth: date('date_of_birth'),
  cpf: text('cpf'),
  isIrDependent: boolean('is_ir_dependent').default(false),
  isHealthPlan: boolean('is_health_plan').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_dependents_collaborator').on(table.collaboratorId),
}));
