import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';

export const supplierContacts = pgTable('supplier_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
  contactName: text('contact_name'),
  useType: text('use_type'),  // 'commercial' | 'financial' | 'operational' | 'billing'
  email: text('email'),
  emailSecondary: text('email_secondary'),
  phone: text('phone'),
  phoneMobile: text('phone_mobile'),
  phoneSms: text('phone_sms'),
  whatsapp: boolean('whatsapp').notNull().default(false),
  homepage: text('homepage'),
  notes: text('notes'),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  supplierIdx: index('idx_supplier_contacts_supplier').on(table.supplierId),
  primaryIdx: index('idx_supplier_contacts_primary').on(table.supplierId, table.isPrimary),
  activeIdx: index('idx_supplier_contacts_active').on(table.isActive),
}));
