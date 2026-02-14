import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { guaranteeTypes } from './guarantee-types';

export const guaranteeDocumentTemplates = pgTable('guarantee_document_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  guaranteeTypeId: uuid('guarantee_type_id').notNull().references(() => guaranteeTypes.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentLabel: text('document_label').notNull(),
  description: text('description'),
  isRequired: boolean('is_required').default(true),
  acceptedMimeTypes: text('accepted_mime_types').array().default(['application/pdf']),
  maxFileSizeMb: integer('max_file_size_mb').default(25),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  guaranteeTypeIdx: index('idx_guar_doc_templates').on(table.guaranteeTypeId),
}));
