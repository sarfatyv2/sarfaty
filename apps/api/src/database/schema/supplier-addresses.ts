import { pgTable, uuid, text, boolean, timestamp, index, char } from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';

export const supplierAddresses = pgTable('supplier_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  useType: text('use_type'),  // 'commercial' | 'fiscal' | 'correspondence' | 'billing'
  street: text('street'),
  number: text('number'),
  withoutNumber: boolean('without_number').notNull().default(false),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  zipCode: text('zip_code'),
  city: text('city'),
  state: char('state', { length: 2 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  supplierIdx: index('idx_supplier_addresses_supplier').on(table.supplierId),
  primaryIdx: index('idx_supplier_addresses_primary').on(table.supplierId, table.isPrimary),
  useTypeIdx: index('idx_supplier_addresses_use_type').on(table.useType),
}));
