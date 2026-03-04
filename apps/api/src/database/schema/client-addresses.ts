import { pgTable, uuid, text, boolean, timestamp, index, char } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const clientAddresses = pgTable('client_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  useType: text('use_type'),  // 'commercial' | 'fiscal' | 'correspondence' | 'billing'
  street: text('street'),
  number: text('number'),
  withoutNumber: boolean('without_number').notNull().default(false),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  zipCode: text('zip_code'),
  city: text('city'),
  state: char('state', { length: 2 }),
  source: text('source'),  // 'manual' | 'vadu' | 'serasa' | 'brasilapi' | 'creditbox'
  sourceQueriedAt: timestamp('source_queried_at', { withTimezone: true }),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_client_addresses_client').on(table.clientId),
  primaryIdx: index('idx_client_addresses_primary').on(table.clientId, table.isPrimary),
  useTypeIdx: index('idx_client_addresses_use_type').on(table.useType),
}));
