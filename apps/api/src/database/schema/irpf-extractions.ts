import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  date,
  integer,
  timestamp,
  index,
  unique,
  jsonb,
} from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { clientAuthorizedPersons } from './client-authorized-persons';

export const irpfExtractions = pgTable('irpf_extractions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  authorizedPersonId: uuid('authorized_person_id').references(() => clientAuthorizedPersons.id, { onDelete: 'set null' }),

  // Canonical key: (cpf + exercise_year) must be unique
  cpf: text('cpf').notNull(),
  exerciseYear: integer('exercise_year').notNull(),
  calendarYear: integer('calendar_year').notNull(),

  // Identification
  fullName: text('full_name'),
  birthDate: date('birth_date'),
  occupation: text('occupation'),
  occupationCode: text('occupation_code'),
  nationality: text('nationality'),
  naturality: text('naturality'),
  phone: text('phone'),
  email: text('email'),

  // Address extracted from declaration
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  addressNeighborhood: text('address_neighborhood'),
  addressCity: text('address_city'),
  addressState: text('address_state'),
  addressZip: text('address_zip'),

  // Spouse
  spouseName: text('spouse_name'),
  spouseCpf: text('spouse_cpf'),

  // Declaration context
  declarationType: text('declaration_type'),       // 'original' | 'rectifying'
  taxationOption: text('taxation_option'),          // 'deductions' | 'simplified'
  receiptNumber: text('receipt_number'),
  deliveryTimestamp: timestamp('delivery_timestamp', { withTimezone: true }),

  // Financial summary (scalar for credit analysis queries)
  totalTaxableIncome: numeric('total_taxable_income', { precision: 18, scale: 2 }),
  totalExemptIncome: numeric('total_exempt_income', { precision: 18, scale: 2 }),
  totalExclusiveIncome: numeric('total_exclusive_income', { precision: 18, scale: 2 }),
  totalDeductions: numeric('total_deductions', { precision: 18, scale: 2 }),
  taxableBase: numeric('taxable_base', { precision: 18, scale: 2 }),
  taxDue: numeric('tax_due', { precision: 18, scale: 2 }),
  taxPaid: numeric('tax_paid', { precision: 18, scale: 2 }),
  taxRefund: numeric('tax_refund', { precision: 18, scale: 2 }),
  taxBalance: numeric('tax_balance', { precision: 18, scale: 2 }),
  totalAssetsCurrentYear: numeric('total_assets_current_year', { precision: 18, scale: 2 }),
  totalAssetsPreviousYear: numeric('total_assets_previous_year', { precision: 18, scale: 2 }),
  totalDebtsCurrentYear: numeric('total_debts_current_year', { precision: 18, scale: 2 }),
  totalDebtsPreviousYear: numeric('total_debts_previous_year', { precision: 18, scale: 2 }),

  // Detailed lists (JSONB — typed via Zod in the app layer)
  dependents: jsonb('dependents'),
  taxableIncomeItems: jsonb('taxable_income_items'),
  exemptIncomeItems: jsonb('exempt_income_items'),
  exclusiveIncomeItems: jsonb('exclusive_income_items'),
  payments: jsonb('payments'),
  assets: jsonb('assets'),
  debts: jsonb('debts'),

  // Extraction metadata
  extractionStatus: text('extraction_status').notNull().default('pending'),
  // 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review'
  extractionConfidence: text('extraction_confidence'),  // 'high' | 'medium' | 'low'
  ocrApplied: boolean('ocr_applied').notNull().default(false),
  needsReview: boolean('needs_review').notNull().default(false),
  conflicts: jsonb('conflicts'),      // IrpfConflict[]
  extractionLog: jsonb('extraction_log'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('uq_irpf_cpf_exercise').on(table.cpf, table.exerciseYear),
  index('idx_irpf_extractions_client').on(table.clientId),
  index('idx_irpf_extractions_cpf').on(table.cpf),
  index('idx_irpf_extractions_exercise').on(table.exerciseYear),
  index('idx_irpf_extractions_status').on(table.extractionStatus),
  index('idx_irpf_extractions_needs_review').on(table.needsReview),
]);
