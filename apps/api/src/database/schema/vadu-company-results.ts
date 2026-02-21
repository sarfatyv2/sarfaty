import { pgTable, uuid, text, boolean, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const vaduCompanyResults = pgTable('vadu_company_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  
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
  clientIdx: index('idx_vadu_company_results_client').on(table.clientId),
  cnpjIdx: index('idx_vadu_company_results_cnpj').on(table.cnpj),
}));
