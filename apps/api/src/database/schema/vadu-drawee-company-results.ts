import { pgTable, uuid, text, boolean, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const vaduDraweeCompanyResults = pgTable('vadu_drawee_company_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  companyName: text('company_name'),
  tradeName: text('trade_name'),
  revenueStatus: text('revenue_status'),
  revenueStatusDate: timestamp('revenue_status_date'),
  specialStatus: text('special_status'),
  capitalSocial: numeric('capital_social', { precision: 15, scale: 2 }),
  legalNature: text('legal_nature'),
  isSimplesNacional: boolean('is_simples_nacional'),
  companySize: text('company_size'),
  environmentalScore: numeric('environmental_score', { precision: 10, scale: 2 }),
  environmentalLevel: text('environmental_level'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_vadu_drawee_company_drawee').on(table.draweeId),
  cnpjIdx: index('idx_vadu_drawee_company_cnpj').on(table.cnpj),
}));
