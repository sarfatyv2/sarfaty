import { pgTable, uuid, text, numeric, date, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { debentureIssuances } from './debenture-issuances';

export const debentureSeries = pgTable('debenture_series', {
  id: uuid('id').primaryKey().defaultRandom(),
  issuanceId: uuid('issuance_id').notNull().references(() => debentureIssuances.id, { onDelete: 'restrict' }),
  seriesNumber: integer('series_number').notNull(),
  indexType: text('index_type').notNull(),          // 'CDI' | 'IPCA' | 'fixed'
  indexPercentage: numeric('index_percentage', { precision: 15, scale: 4 }),   // ex: 120 para 120% CDI
  issuanceRate: numeric('issuance_rate', { precision: 15, scale: 4 }),
  stdDeviation: numeric('std_deviation', { precision: 15, scale: 4 }),
  quantity: integer('quantity').notNull(),
  balanceQuantity: integer('balance_quantity').notNull(),
  maturityDate: date('maturity_date').notNull(),
  targetAudience: text('target_audience'),           // 'general' | 'qualified' | 'professional'
  allowWebRedemption: boolean('allow_web_redemption').notNull().default(false),
  publishOnPortal: boolean('publish_on_portal').notNull().default(false),
  status: text('status').notNull().default('open'),
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  issuanceIdx: index('idx_debenture_series_issuance').on(table.issuanceId),
  statusIdx: index('idx_debenture_series_status').on(table.status),
}));
