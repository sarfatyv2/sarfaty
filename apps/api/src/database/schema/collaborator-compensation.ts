import { pgTable, uuid, text, numeric, date, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';
import { profiles } from './profiles';

export const collaboratorCompensation = pgTable('collaborator_compensation', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id, { onDelete: 'cascade' }),
  effectiveDate: date('effective_date').notNull(),
  movementType: text('movement_type').notNull(),
  previousSalary: numeric('previous_salary', { precision: 15, scale: 2 }),
  newSalary: numeric('new_salary', { precision: 15, scale: 2 }),
  increaseAmount: numeric('increase_amount', { precision: 15, scale: 2 }),
  increasePct: numeric('increase_pct', { precision: 5, scale: 2 }),
  previousRole: text('previous_role'),
  newRole: text('new_role'),
  previousLevel: text('previous_level'),
  newLevel: text('new_level'),
  reason: text('reason'),
  approvedBy: uuid('approved_by').references(() => profiles.id),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_compensation_collaborator').on(table.collaboratorId),
  effectiveDateIdx: index('idx_compensation_effective_date').on(table.effectiveDate),
}));
