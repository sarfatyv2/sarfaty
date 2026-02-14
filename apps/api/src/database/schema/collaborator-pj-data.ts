import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';

export const collaboratorPjData = pgTable('collaborator_pj_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').unique().references(() => collaborators.id, { onDelete: 'cascade' }),
  companyName: text('company_name'),
  companyCnpj: text('company_cnpj'),
  companyCnae: text('company_cnae'),
  serviceContractPath: text('service_contract_path'),
  contractSignedAt: timestamp('contract_signed_at', { withTimezone: true }),
  monthlyNfAmount: numeric('monthly_nf_amount', { precision: 15, scale: 2 }),
  nfDueDay: integer('nf_due_day').default(25),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
