import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const clientContacts = pgTable('client_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
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
  clientIdx: index('idx_client_contacts_client').on(table.clientId),
  primaryIdx: index('idx_client_contacts_primary').on(table.clientId, table.isPrimary),
  activeIdx: index('idx_client_contacts_active').on(table.isActive),
}));
