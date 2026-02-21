import { pgTable, uuid, text, boolean, numeric, date, integer, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { segments } from './segments';
import { creditProducts } from './credit-products';
import { teams } from './teams';
import { regions } from './regions';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Tipo de pessoa
  personType: text('person_type').notNull().default('company'),  // 'individual' | 'company'
  companyName: text('company_name').notNull(),
  cnpj: text('cnpj').unique(),  // nullable para suporte a PF
  cnpjRoot: text('cnpj_root'),  // 8 dígitos (agrupamento de filiais)
  tradeName: text('trade_name'),

  // Documentos de identificação (PF)
  cpf: text('cpf'),  // 11 dígitos, sem formatação
  rg: text('rg'),
  rgIssuer: text('rg_issuer'),  // órgão emissor (ex: SSP/SP)
  rgIssuedAt: date('rg_issued_at'),
  cnhNumber: text('cnh_number'),  // número de registro da CNH (distinto do CPF)
  cnhIssuedAt: date('cnh_issued_at'),
  cnhExpiresAt: date('cnh_expires_at'),
  passportNumber: text('passport_number'),
  foreignId: text('foreign_id'),  // RNE ou equivalente

  // Ponteiros para arquivos de identidade (FK → client_documents, SET NULL)
  // Definidos como text aqui para evitar dependência circular na definição estática;
  // a FK real é aplicada via migration ALTER TABLE.
  rgDocumentId: uuid('rg_document_id'),
  cnhDocumentId: uuid('cnh_document_id'),

  // Dados PF complementares
  birthDate: date('birth_date'),
  gender: text('gender'),  // 'M' | 'F' | 'other'
  nationality: text('nationality'),
  maritalStatus: text('marital_status'),
  naturality: text('naturality'),
  motherName: text('mother_name'),
  fatherName: text('father_name'),

  // Dados PJ complementares
  stateRegistration: text('state_registration'),  // inscrição estadual
  cityRegistration: text('city_registration'),    // inscrição municipal
  foundedAt: date('founded_at'),
  establishedAt: date('established_at'),  // data de constituição formal

  // Ciclo cadastral
  registrationStatus: text('registration_status').notNull().default('prospect'),
  prospectAt: timestamp('prospect_at', { withTimezone: true }),
  renewedAt: timestamp('renewed_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closureReason: text('closure_reason'),

  // Compliance KYC/AML
  isPep: boolean('is_pep').notNull().default(false),
  isPepRelated: boolean('is_pep_related').notNull().default(false),
  isOfacListed: boolean('is_ofac_listed').notNull().default(false),
  hasRiskProfession: boolean('has_risk_profession').notNull().default(false),
  hasRiskActivity: boolean('has_risk_activity').notNull().default(false),
  hasRiskCity: boolean('has_risk_city').notNull().default(false),
  riskRating: text('risk_rating'),  // 'AA' | 'A' | 'B' | 'C' | 'D' | 'E'
  revenueSituation: text('revenue_situation'),  // situação cadastral Receita Federal

  // Relacionamentos
  segmentId: uuid('segment_id').notNull().references(() => segments.id),
  creditProductId: uuid('credit_product_id').notNull().references(() => creditProducts.id),
  assignedTo: uuid('assigned_to').notNull().references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  regionId: uuid('region_id').references(() => regions.id),
  economicGroupId: uuid('economic_group_id'),  // FK → economic_groups(id), aplicada via migration

  // Campos legados de contato/endereço (mantidos por compatibilidade — migrar para sub-tabelas)
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  addressNeighborhood: text('address_neighborhood'),
  addressCity: text('address_city'),
  addressState: text('address_state'),
  addressZip: text('address_zip'),

  // Operacional
  requestedAmount: numeric('requested_amount', { precision: 15, scale: 2 }),
  approvedAmount: numeric('approved_amount', { precision: 15, scale: 2 }),
  hasGuarantees: boolean('has_guarantees').default(false),
  isJudicialRecovery: boolean('is_judicial_recovery').default(false),
  workingCapitalNotes: jsonb('working_capital_notes'),

  // Status e datas de workflow
  status: text('status').notNull().default('draft'),
  cnpjStatus: text('cnpj_status'),
  cnpjValidatedAt: timestamp('cnpj_validated_at', { withTimezone: true }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  homologatedAt: timestamp('homologated_at', { withTimezone: true }),

  // Rastreabilidade legado
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  assignedIdx: index('idx_clients_assigned').on(table.assignedTo),
  teamIdx: index('idx_clients_team').on(table.teamId),
  regionIdx: index('idx_clients_region').on(table.regionId),
  segmentIdx: index('idx_clients_segment').on(table.segmentId),
  productIdx: index('idx_clients_product').on(table.creditProductId),
  statusIdx: index('idx_clients_status').on(table.status),
  cnpjIdx: index('idx_clients_cnpj').on(table.cnpj),
  cpfIdx: index('idx_clients_cpf').on(table.cpf),
  personTypeIdx: index('idx_clients_person_type').on(table.personType),
  registrationStatusIdx: index('idx_clients_registration_status').on(table.registrationStatus),
  economicGroupIdx: index('idx_clients_economic_group').on(table.economicGroupId),
  createdIdx: index('idx_clients_created').on(table.createdAt),
}));
