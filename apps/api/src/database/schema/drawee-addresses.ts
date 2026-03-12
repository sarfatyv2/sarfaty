import { pgTable, uuid, text, boolean, timestamp, index, char } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const draweeAddresses = pgTable('drawee_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  useType: text('use_type'),  // 'commercial' | 'fiscal' | 'correspondence' | 'billing'
  street: text('street'),
  number: text('number'),
  withoutNumber: boolean('without_number').notNull().default(false),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  zipCode: text('zip_code'),
  city: text('city'),
  state: char('state', { length: 2 }),

  // Campos duplicados de cobrança (legado — tipo 'billing' do sistema antigo)
  billingStreet: text('billing_street'),
  billingNumber: text('billing_number'),
  billingComplement: text('billing_complement'),
  billingNeighborhood: text('billing_neighborhood'),
  billingZipCode: text('billing_zip_code'),
  billingCity: text('billing_city'),
  billingState: char('billing_state', { length: 2 }),

  source: text('source'),  // 'manual' | 'vadu' | 'serasa' | 'brasilapi' | 'creditbox' | 'allcheck'
  sourceQueriedAt: timestamp('source_queried_at', { withTimezone: true }),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_addresses_drawee').on(table.draweeId),
  primaryIdx: index('idx_drawee_addresses_primary').on(table.draweeId, table.isPrimary),
  useTypeIdx: index('idx_drawee_addresses_use_type').on(table.useType),
  sourceIdx: index('idx_drawee_addresses_source').on(table.draweeId, table.source),
}));
