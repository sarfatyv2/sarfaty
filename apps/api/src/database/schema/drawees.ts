import { pgTable, uuid, text, boolean, integer, date, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { segments } from './segments';
import { economicGroups } from './economic-groups';

export const drawees = pgTable('drawees', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Tipo de pessoa
  personType: text('person_type').notNull().default('company'),  // 'individual' | 'company'
  cpf: text('cpf'),
  cnpj: text('cnpj').unique(),
  cnpjRoot: text('cnpj_root'),
  tradeName: text('trade_name'),
  companyName: text('company_name').notNull(),
  legalName: text('legal_name'),

  // Dados PF (quando PF)
  rg: text('rg'),
  birthDate: date('birth_date'),
  gender: text('gender'),  // 'M' | 'F' | 'other'

  // Ponteiros para documentos de identidade ativos (FK aplicada via migration)
  rgDocumentId: uuid('rg_document_id'),
  cnhDocumentId: uuid('cnh_document_id'),

  // Compliance
  isPep: boolean('is_pep').notNull().default(false),
  isOfacListed: boolean('is_ofac_listed').notNull().default(false),
  riskRating: text('risk_rating'),
  creditScore: integer('credit_score'),

  // Gestão
  assignedTo: uuid('assigned_to').references(() => profiles.id),
  segmentId: uuid('segment_id').references(() => segments.id),
  economicGroupId: uuid('economic_group_id').references(() => economicGroups.id, { onDelete: 'set null' }),

  // Status
  status: text('status').notNull().default('active'),  // 'active' | 'inactive' | 'blocked'
  blockedAt: timestamp('blocked_at', { withTimezone: true }),
  blockReason: text('block_reason'),

  // Rastreabilidade legado
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  cnpjIdx: index('idx_drawees_cnpj').on(table.cnpj),
  cpfIdx: index('idx_drawees_cpf').on(table.cpf),
  personTypeIdx: index('idx_drawees_person_type').on(table.personType),
  statusIdx: index('idx_drawees_status').on(table.status),
  segmentIdx: index('idx_drawees_segment').on(table.segmentId),
  assignedIdx: index('idx_drawees_assigned').on(table.assignedTo),
  economicGroupIdx: index('idx_drawees_economic_group').on(table.economicGroupId),
}));
