import { pgTable, uuid, text, integer, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';
import { profiles } from './profiles';

export const draweeDocuments = pgTable('drawee_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentCategory: text('document_category').notNull().default('base'),
  documentLabel: text('document_label'),
  storagePath: text('storage_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  validationStatus: text('validation_status').default('pending'),
  validationResult: jsonb('validation_result'),
  validatedAt: timestamp('validated_at', { withTimezone: true }),
  extractedData: jsonb('extracted_data'),
  uploadedBy: uuid('uploaded_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_docs_drawee').on(table.draweeId),
  typeIdx: index('idx_drawee_docs_type').on(table.documentType),
  validationIdx: index('idx_drawee_docs_validation').on(table.validationStatus),
}));
