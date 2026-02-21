import { pgTable, uuid, text, integer, boolean, numeric, date, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { segmentDocumentTemplates } from './segment-document-templates';
import { productDocumentTemplates } from './product-document-templates';
import { guaranteeDocumentTemplates } from './guarantee-document-templates';
import { clientGuarantees } from './client-guarantees';
import { profiles } from './profiles';

export const clientDocuments = pgTable('client_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentCategory: text('document_category').notNull().default('base'),
  segmentTemplateId: uuid('segment_template_id').references(() => segmentDocumentTemplates.id),
  productTemplateId: uuid('product_template_id').references(() => productDocumentTemplates.id),
  guaranteeTemplateId: uuid('guarantee_template_id').references(() => guaranteeDocumentTemplates.id),
  clientGuaranteeId: uuid('client_guarantee_id').references(() => clientGuarantees.id),
  documentLabel: text('document_label'),
  referenceYear: integer('reference_year'),
  referenceMonth: integer('reference_month'),
  partnerName: text('partner_name'),
  storagePath: text('storage_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  validationStatus: text('validation_status').default('pending'),
  validationResult: jsonb('validation_result'),
  validatedAt: timestamp('validated_at', { withTimezone: true }),
  extractedData: jsonb('extracted_data'),
  uploadedBy: uuid('uploaded_by').notNull().references(() => profiles.id),

  // Checagem de canhoto (legado: credito_canhoto_checagem)
  canhotoReference: text('canhoto_reference'),
  canhotoDate: date('canhoto_date'),
  canhotoStatus: text('canhoto_status'),          // 'received' | 'pending' | 'lost'
  collectionOrder: text('collection_order'),
  collectionStatus: text('collection_status'),    // 'scheduled' | 'done' | 'cancelled'
  verificationDate: date('verification_date'),
  verificationStatus: text('verification_status'), // 'pending' | 'approved' | 'rejected'
  verificationNotes: text('verification_notes'),
  confirmationType: text('confirmation_type'),    // 'physical' | 'digital' | 'implicit'
  confirmationStatus: text('confirmation_status'), // 'pending' | 'confirmed' | 'rejected'
  nfeNumber: text('nfe_number'),
  nfeValue: numeric('nfe_value', { precision: 18, scale: 4 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_client_docs_client').on(table.clientId),
  typeIdx: index('idx_client_docs_type').on(table.documentType),
  categoryIdx: index('idx_client_docs_category').on(table.documentCategory),
  validationIdx: index('idx_client_docs_validation').on(table.validationStatus),
}));
