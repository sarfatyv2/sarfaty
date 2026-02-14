import { pgTable, uuid, text, boolean, numeric, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { segments } from './segments';
import { creditProducts } from './credit-products';
import { teams } from './teams';
import { regions } from './regions';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyName: text('company_name').notNull(),
  cnpj: text('cnpj').notNull().unique(),
  tradeName: text('trade_name'),
  segmentId: uuid('segment_id').notNull().references(() => segments.id),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  addressNeighborhood: text('address_neighborhood'),
  addressCity: text('address_city'),
  addressState: text('address_state'),
  addressZip: text('address_zip'),
  creditProductId: uuid('credit_product_id').notNull().references(() => creditProducts.id),
  requestedAmount: numeric('requested_amount', { precision: 15, scale: 2 }),
  approvedAmount: numeric('approved_amount', { precision: 15, scale: 2 }),
  hasGuarantees: boolean('has_guarantees').default(false),
  isJudicialRecovery: boolean('is_judicial_recovery').default(false),
  workingCapitalNotes: jsonb('working_capital_notes'),
  status: text('status').notNull().default('draft'),
  assignedTo: uuid('assigned_to').notNull().references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  regionId: uuid('region_id').references(() => regions.id),
  cnpjStatus: text('cnpj_status'),
  cnpjValidatedAt: timestamp('cnpj_validated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  homologatedAt: timestamp('homologated_at', { withTimezone: true }),
}, (table) => ({
  assignedIdx: index('idx_clients_assigned').on(table.assignedTo),
  teamIdx: index('idx_clients_team').on(table.teamId),
  regionIdx: index('idx_clients_region').on(table.regionId),
  segmentIdx: index('idx_clients_segment').on(table.segmentId),
  productIdx: index('idx_clients_product').on(table.creditProductId),
  statusIdx: index('idx_clients_status').on(table.status),
  cnpjIdx: index('idx_clients_cnpj').on(table.cnpj),
  createdIdx: index('idx_clients_created').on(table.createdAt),
}));
