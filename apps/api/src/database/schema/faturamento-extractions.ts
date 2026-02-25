import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  index,
  unique,
  jsonb,
} from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const faturamentoExtractions = pgTable('faturamento_extractions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),

  // Canonical key: (cnpj + year) must be unique
  cnpj: text('cnpj').notNull(),
  year: integer('year').notNull(),

  // Identification
  cpf: text('cpf'),
  companyName: text('company_name'),

  // Monthly revenues (JSONB — { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec })
  monthlyRevenues: jsonb('monthly_revenues'),

  // Financial summary (scalar for queries)
  totalAnnualRevenue: numeric('total_annual_revenue', { precision: 18, scale: 2 }),

  // Free-text notes extracted from the document
  documentDescription: text('document_description'),

  // Extraction metadata
  extractionStatus: text('extraction_status').notNull().default('pending'),
  // 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review'
  extractionConfidence: text('extraction_confidence'),
  // 'high' | 'medium' | 'low'
  ocrApplied: boolean('ocr_applied').notNull().default(false),
  needsReview: boolean('needs_review').notNull().default(false),
  extractionLog: jsonb('extraction_log'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('uq_faturamento_cnpj_year').on(table.cnpj, table.year),
  index('idx_faturamento_extractions_client').on(table.clientId),
  index('idx_faturamento_extractions_cnpj').on(table.cnpj),
  index('idx_faturamento_extractions_year').on(table.year),
  index('idx_faturamento_extractions_status').on(table.extractionStatus),
  index('idx_faturamento_extractions_needs_review').on(table.needsReview),
]);
