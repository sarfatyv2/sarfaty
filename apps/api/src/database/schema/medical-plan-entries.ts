import { pgTable, uuid, text, boolean, numeric, date, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';

export const medicalPlanEntries = pgTable('medical_plan_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id),
  planType: text('plan_type'),
  provider: text('provider').default('Agrega'),
  beneficiaryName: text('beneficiary_name').notNull(),
  beneficiaryRelationship: text('beneficiary_relationship').notNull(),
  beneficiaryCpf: text('beneficiary_cpf'),
  isActive: boolean('is_active').default(true),
  enrollmentDate: date('enrollment_date'),
  cancellationDate: date('cancellation_date'),
  monthlyCost: numeric('monthly_cost', { precision: 15, scale: 2 }),
  companySubsidyPct: numeric('company_subsidy_pct', { precision: 5, scale: 2 }),
  employeeCost: numeric('employee_cost', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_medical_plan_collaborator').on(table.collaboratorId),
}));
