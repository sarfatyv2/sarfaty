import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const debentureIssuers = pgTable('debenture_issuers', {
  id: uuid('id').primaryKey().defaultRandom(),
  cnpj: text('cnpj').notNull().unique(),
  legalName: text('legal_name').notNull(),
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  addressNeighborhood: text('address_neighborhood'),
  addressCity: text('address_city'),
  addressState: text('address_state'),
  addressZip: text('address_zip'),
  bankCode: text('bank_code'),
  bankBranch: text('bank_branch'),
  bankAccount: text('bank_account'),
  status: text('status').notNull().default('active'),
  legacySgsId: integer('legacy_sgs_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  cnpjIdx: index('idx_debenture_issuers_cnpj').on(table.cnpj),
  statusIdx: index('idx_debenture_issuers_status').on(table.status),
}));
