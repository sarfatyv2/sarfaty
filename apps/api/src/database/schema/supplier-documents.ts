import { pgTable, uuid, text, integer, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';
import { profiles } from './profiles';

export const supplierDocuments = pgTable('supplier_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade' }),
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
  supplierIdx: index('idx_supplier_docs_supplier').on(table.supplierId),
  typeIdx: index('idx_supplier_docs_type').on(table.documentType),
  validationIdx: index('idx_supplier_docs_validation').on(table.validationStatus),
}));
