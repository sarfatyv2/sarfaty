import { pgTable, uuid, text, integer, date, timestamp, index } from 'drizzle-orm/pg-core';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Tipo de pessoa
  personType: text('person_type').notNull().default('company'),  // 'individual' | 'company'
  cpf: text('cpf'),
  cnpj: text('cnpj').unique(),
  tradeName: text('trade_name'),
  companyName: text('company_name').notNull(),
  serviceCategory: text('service_category'),  // categoria de serviço prestado

  // Ponteiros para documentos de identidade ativos (FK aplicada via migration)
  rgDocumentId: uuid('rg_document_id'),
  cnhDocumentId: uuid('cnh_document_id'),

  // Ciclo
  onboardedAt: date('onboarded_at'),
  offboardedAt: date('offboarded_at'),
  offboardingReason: text('offboarding_reason'),
  status: text('status').notNull().default('active'),  // 'active' | 'inactive' | 'blocked'

  // Rastreabilidade legado
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  cnpjIdx: index('idx_suppliers_cnpj').on(table.cnpj),
  cpfIdx: index('idx_suppliers_cpf').on(table.cpf),
  statusIdx: index('idx_suppliers_status').on(table.status),
  personTypeIdx: index('idx_suppliers_person_type').on(table.personType),
  serviceCategoryIdx: index('idx_suppliers_service_category').on(table.serviceCategory),
}));
