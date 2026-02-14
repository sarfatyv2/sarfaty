import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { segments } from './segments';

export const segmentDocumentTemplates = pgTable('segment_document_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  segmentId: uuid('segment_id').notNull().references(() => segments.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentLabel: text('document_label').notNull(),
  description: text('description'),
  isRequired: boolean('is_required').default(true),
  acceptedMimeTypes: text('accepted_mime_types').array().default(['application/pdf']),
  maxFileSizeMb: integer('max_file_size_mb').default(25),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  segmentIdx: index('idx_seg_doc_templates_segment').on(table.segmentId),
}));
