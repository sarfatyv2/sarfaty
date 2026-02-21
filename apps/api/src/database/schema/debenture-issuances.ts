import { pgTable, uuid, text, numeric, date, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { debentureIssuers } from './debenture-issuers';
import { investmentAssets } from './investment-assets';

export const debentureIssuances = pgTable('debenture_issuances', {
  id: uuid('id').primaryKey().defaultRandom(),
  issuerId: uuid('issuer_id').notNull().references(() => debentureIssuers.id),
  assetId: uuid('asset_id').references(() => investmentAssets.id),
  issuanceNumber: integer('issuance_number').notNull(),
  name: text('name').notNull(),
  yieldType: text('yield_type').notNull(),         // 'CDI' | 'IPCA' | 'fixed' | 'other'
  issuanceType: text('issuance_type').notNull().default('private'),
  species: text('species').notNull().default('subordinated'),
  issuanceForm: text('issuance_form'),
  issuanceDate: date('issuance_date').notNull(),
  maturityDate: date('maturity_date').notNull(),
  integrationDeadline: date('integration_deadline'),
  seriesCount: integer('series_count'),
  totalQuantity: integer('total_quantity').notNull(),
  totalValue: numeric('total_value', { precision: 15, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
  penaltyRate: numeric('penalty_rate', { precision: 5, scale: 2 }),
  moraRate: numeric('mora_rate', { precision: 5, scale: 2 }),
  balance: numeric('balance', { precision: 15, scale: 2 }),
  status: text('status').notNull().default('open'),
  prospectusFilePath: text('prospectus_file_path'),   // Supabase Storage path
  ageDocumentPath: text('age_document_path'),          // Supabase Storage path
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  issuerIdx: index('idx_debenture_issuances_issuer').on(table.issuerId),
  statusIdx: index('idx_debenture_issuances_status').on(table.status),
  dateIdx: index('idx_debenture_issuances_date').on(table.issuanceDate),
}));
