import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const draweeContacts = pgTable('drawee_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  contactName: text('contact_name'),
  useType: text('use_type'),  // 'commercial' | 'financial' | 'operational' | 'billing'
  email: text('email'),
  emailSecondary: text('email_secondary'),
  billingEmail: text('billing_email'),   // e-mail para envio de boletos/cobranças
  xmlEmail: text('xml_email'),           // e-mail para envio de XML de NF-e
  phone: text('phone'),
  phoneMobile: text('phone_mobile'),
  phoneSms: text('phone_sms'),
  billingPhone: text('billing_phone'),   // telefone para cobrança
  whatsapp: boolean('whatsapp').notNull().default(false),
  homepage: text('homepage'),
  notes: text('notes'),
  source: text('source'),  // 'manual' | 'vadu' | 'serasa' | 'brasilapi' | 'creditbox' | 'allcheck'
  sourceQueriedAt: timestamp('source_queried_at', { withTimezone: true }),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_contacts_drawee').on(table.draweeId),
  primaryIdx: index('idx_drawee_contacts_primary').on(table.draweeId, table.isPrimary),
  activeIdx: index('idx_drawee_contacts_active').on(table.isActive),
  sourceIdx: index('idx_drawee_contacts_source').on(table.draweeId, table.source),
}));
